using System.Security.Cryptography;
using Dapper;
using Microsoft.AspNetCore.WebUtilities;
using Npgsql;
using StudentHubAPI.Models;

namespace StudentHubAPI.Data;

public sealed class AuthRepository(IDbConnectionFactory connections, ILogger<AuthRepository> logger)
{
    private const string UserColumns = """
        id AS Id,
        email AS Email,
        geslo_hash AS PasswordHash,
        ime AS Name,
        vloga AS Role
        """;

    public async Task<UserAccount?> FindByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var sql = $"SELECT {UserColumns} FROM uporabnik WHERE email = @Email";
        return await QueryUserAsync(sql, new { Email = email }, cancellationToken);
    }

    public async Task<UserAccount?> FindByIdAsync(int id, CancellationToken cancellationToken)
    {
        var sql = $"SELECT {UserColumns} FROM uporabnik WHERE id = @Id";
        return await QueryUserAsync(sql, new { Id = id }, cancellationToken);
    }

    public async Task<UserAccount> CreateAsync(
        string email,
        string passwordHash,
        string name,
        string role,
        CancellationToken cancellationToken)
    {
        var sql = $"""
            INSERT INTO uporabnik (email, geslo_hash, ime, vloga)
            VALUES (@Email, @PasswordHash, @Name, @Role)
            RETURNING {UserColumns}
            """;
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var command = new CommandDefinition(
            sql,
            new { Email = email, PasswordHash = passwordHash, Name = name, Role = role },
            cancellationToken: cancellationToken);
        return await connection.QuerySingleAsync<UserAccount>(command);
    }

    public async Task<IssuedRefreshToken> CreateRefreshAsync(
        int userId,
        DateTimeOffset expiresAt,
        CancellationToken cancellationToken)
    {
        var created = RefreshTokens.Create(expiresAt);
        await using var connection = await OpenAsync(cancellationToken);
        await RefreshTokens.InsertAsync(connection, null, userId, created, cancellationToken);
        return new IssuedRefreshToken(created.RawToken, created.ExpiresAt);
    }

    public async Task<RotatedRefreshToken?> RotateRefreshAsync(
        string? rawToken,
        DateTimeOffset expiresAt,
        CancellationToken cancellationToken)
    {
        if (!RefreshTokens.TryParse(rawToken, out var parsed))
        {
            return null;
        }

        await using var connection = await OpenAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);
        var row = await RefreshTokens.FindForUpdateAsync(connection, transaction, parsed.Id, cancellationToken);
        if (!RefreshTokens.IsUsable(row, parsed.Secret))
        {
            await RevokeFamilyIfReusedAsync(connection, transaction, row, parsed.Secret, cancellationToken);
            return null;
        }

        var created = RefreshTokens.Create(expiresAt);
        await RefreshTokens.MarkReplacedAsync(connection, transaction, row!.Id, created.Id, cancellationToken);
        await RefreshTokens.InsertAsync(connection, transaction, row.UserId, created, cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return new RotatedRefreshToken(row.UserId, created.RawToken, created.ExpiresAt);
    }

    public async Task RevokeRefreshAsync(string? rawToken, CancellationToken cancellationToken)
    {
        if (!RefreshTokens.TryParse(rawToken, out var parsed))
        {
            return;
        }

        await using var connection = await OpenAsync(cancellationToken);
        var row = await RefreshTokens.FindAsync(connection, parsed.Id, cancellationToken);
        if (row is null || !RefreshTokens.HashEquals(row.TokenHash, parsed.Secret) || row.RevokedAt is not null)
        {
            return;
        }

        var sql = "UPDATE osvezitveni_zeton SET preklican = NOW() WHERE id = @Id AND preklican IS NULL";
        var command = new CommandDefinition(sql, new { row.Id }, cancellationToken: cancellationToken);
        await connection.ExecuteAsync(command);
    }

    private async Task RevokeFamilyIfReusedAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction transaction,
        RefreshTokenRow? row,
        byte[] secret,
        CancellationToken cancellationToken)
    {
        if (row is null || row.ReplacedBy is null || !RefreshTokens.HashEquals(row.TokenHash, secret))
        {
            return;
        }

        var sql = """
            UPDATE osvezitveni_zeton
            SET preklican = NOW()
            WHERE uporabnik_id = @UserId AND preklican IS NULL
            """;
        var command = new CommandDefinition(sql, new { row.UserId }, transaction, cancellationToken: cancellationToken);
        await connection.ExecuteAsync(command);
        await transaction.CommitAsync(cancellationToken);
        logger.LogWarning("Ponovna uporaba osvežitvenega žetona za uporabnika {UserId}.", row.UserId);
    }

    private async Task<UserAccount?> QueryUserAsync(string sql, object parameters, CancellationToken cancellationToken)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var command = new CommandDefinition(sql, parameters, cancellationToken: cancellationToken);
        return await connection.QuerySingleOrDefaultAsync<UserAccount>(command);
    }

    private async Task<NpgsqlConnection> OpenAsync(CancellationToken cancellationToken)
    {
        var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        return (NpgsqlConnection)connection;
    }
}

internal sealed class RefreshTokenRow
{
    public Guid Id { get; init; }
    public int UserId { get; init; }
    public string TokenHash { get; init; } = "";
    public DateTime ExpiresAt { get; init; }
    public DateTime? RevokedAt { get; init; }
    public Guid? ReplacedBy { get; init; }
}

internal static class RefreshTokens
{
    public static NewRefreshToken Create(DateTimeOffset expiresAt)
    {
        var id = Guid.NewGuid();
        var secret = RandomNumberGenerator.GetBytes(32);
        var rawToken = $"{id:N}.{WebEncoders.Base64UrlEncode(secret)}";
        var tokenHash = Convert.ToHexString(SHA256.HashData(secret));
        return new NewRefreshToken(id, rawToken, tokenHash, expiresAt);
    }

    public static bool TryParse(string? rawToken, out ParsedRefreshToken parsed)
    {
        parsed = default;
        if (string.IsNullOrWhiteSpace(rawToken))
        {
            return false;
        }

        var separator = rawToken.IndexOf('.');
        if (separator != 32 || !Guid.TryParseExact(rawToken[..separator], "N", out var id))
        {
            return false;
        }

        try
        {
            var secret = WebEncoders.Base64UrlDecode(rawToken[(separator + 1)..]);
            if (secret.Length != 32)
            {
                return false;
            }

            parsed = new ParsedRefreshToken(id, secret);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public static bool HashEquals(string storedHex, byte[] secret)
    {
        try
        {
            var expected = Convert.FromHexString(storedHex);
            var actual = SHA256.HashData(secret);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public static bool IsUsable(RefreshTokenRow? row, byte[] secret)
    {
        return row is not null
            && row.RevokedAt is null
            && row.ReplacedBy is null
            && row.ExpiresAt.ToUniversalTime() > DateTime.UtcNow
            && HashEquals(row.TokenHash, secret);
    }

    public static Task InsertAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction? transaction,
        int userId,
        NewRefreshToken created,
        CancellationToken cancellationToken)
    {
        var sql = """
            INSERT INTO osvezitveni_zeton (id, uporabnik_id, zeton_hash, potece)
            VALUES (@Id, @UserId, @TokenHash, @ExpiresAt)
            """;
        var command = new CommandDefinition(
            sql,
            new { created.Id, UserId = userId, created.TokenHash, ExpiresAt = created.ExpiresAt.UtcDateTime },
            transaction,
            cancellationToken: cancellationToken);
        return connection.ExecuteAsync(command);
    }

    public static Task<RefreshTokenRow?> FindForUpdateAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction transaction,
        Guid id,
        CancellationToken cancellationToken)
    {
        var sql = $"SELECT {Columns} FROM osvezitveni_zeton WHERE id = @Id FOR UPDATE";
        return QueryAsync(connection, transaction, sql, id, cancellationToken);
    }

    public static Task<RefreshTokenRow?> FindAsync(
        NpgsqlConnection connection,
        Guid id,
        CancellationToken cancellationToken)
    {
        var sql = $"SELECT {Columns} FROM osvezitveni_zeton WHERE id = @Id";
        return QueryAsync(connection, null, sql, id, cancellationToken);
    }

    public static Task MarkReplacedAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction transaction,
        Guid currentId,
        Guid newId,
        CancellationToken cancellationToken)
    {
        var sql = "UPDATE osvezitveni_zeton SET zamenjan_z = @NewId WHERE id = @Id";
        var command = new CommandDefinition(
            sql,
            new { Id = currentId, NewId = newId },
            transaction,
            cancellationToken: cancellationToken);
        return connection.ExecuteAsync(command);
    }

    private const string Columns = """
        id AS Id,
        uporabnik_id AS UserId,
        zeton_hash AS TokenHash,
        potece AS ExpiresAt,
        preklican AS RevokedAt,
        zamenjan_z AS ReplacedBy
        """;

    private static Task<RefreshTokenRow?> QueryAsync(
        NpgsqlConnection connection,
        NpgsqlTransaction? transaction,
        string sql,
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new CommandDefinition(sql, new { Id = id }, transaction, cancellationToken: cancellationToken);
        return connection.QuerySingleOrDefaultAsync<RefreshTokenRow>(command);
    }
}

internal readonly record struct ParsedRefreshToken(Guid Id, byte[] Secret);

internal readonly record struct NewRefreshToken(Guid Id, string RawToken, string TokenHash, DateTimeOffset ExpiresAt);
