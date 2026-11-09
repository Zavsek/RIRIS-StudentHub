using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Npgsql;
using StudentHubAPI.Data;
using StudentHubAPI.Models;
using StudentHubAPI.Services;

namespace StudentHubAPI.Handlers;

public sealed class AuthHandler(
    AuthRepository accounts,
    PasswordHasher passwords,
    JwtTokenService tokens,
    IOptions<JwtOptions> jwtOptions)
{
    private const string InvalidCredentialsMessage = "Napačna e-pošta ali geslo.";
    private const string InvalidRefreshMessage = "Osvežitveni žeton ni veljaven.";

    public async Task<AuthResult<AuthSession>> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var validationError = AuthValidation.RegistrationError(request);
        if (validationError is not null)
        {
            return Failure<AuthSession>(StatusCodes.Status400BadRequest, "validation", validationError);
        }

        try
        {
            var user = await accounts.CreateAsync(
                AuthValidation.NormalizeEmail(request.Email!),
                passwords.Hash(request.Password!),
                request.Name!.Trim(),
                UserRoles.Student,
                cancellationToken);
            return new AuthResult<AuthSession>.Success(await IssueAsync(user, cancellationToken));
        }
        catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return Failure<AuthSession>(StatusCodes.Status409Conflict, "email_taken", "Uporabnik s to e-pošto že obstaja.");
        }
    }

    public async Task<AuthResult<AuthSession>> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var password = request.Password ?? "";
        if (password.Length == 0 || Encoding.UTF8.GetByteCount(password) > 72)
        {
            passwords.Verify("invalid", passwords.DummyHash);
            return InvalidCredentials();
        }

        var user = await FindForLoginAsync(request.Email, cancellationToken);
        var hash = user?.PasswordHash ?? passwords.DummyHash;
        var passwordMatches = passwords.Verify(password, hash);
        if (user is null || !passwordMatches)
        {
            return InvalidCredentials();
        }

        return new AuthResult<AuthSession>.Success(await IssueAsync(user, cancellationToken));
    }

    public async Task<AuthResult<AuthSession>> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken)
    {
        var expiresAt = DateTimeOffset.UtcNow.AddDays(jwtOptions.Value.RefreshExpiresDays);
        var rotated = await accounts.RotateRefreshAsync(request.RefreshToken, expiresAt, cancellationToken);
        if (rotated is null)
        {
            return Failure<AuthSession>(StatusCodes.Status401Unauthorized, "invalid_refresh", InvalidRefreshMessage);
        }

        var user = await accounts.FindByIdAsync(rotated.UserId, cancellationToken);
        if (user is null)
        {
            return Failure<AuthSession>(StatusCodes.Status401Unauthorized, "invalid_refresh", InvalidRefreshMessage);
        }

        var access = tokens.Create(user.Id, user.Email, user.Name, user.Role);
        var session = new AuthSession(
            ToUser(user),
            new AuthTokens(access.Token, access.ExpiresAt, rotated.RawToken, rotated.ExpiresAt));
        return new AuthResult<AuthSession>.Success(session);
    }

    public Task LogoutAsync(LogoutRequest request, CancellationToken cancellationToken) =>
        accounts.RevokeRefreshAsync(request.RefreshToken, cancellationToken);

    public async Task<AuthResult<AuthUser>> GetCurrentUserAsync(ClaimsPrincipal principal, CancellationToken cancellationToken)
    {
        if (!AuthUserId.TryRead(principal, out var id))
        {
            return Failure<AuthUser>(StatusCodes.Status401Unauthorized, "unauthorized", "Zahtevana je prijava.");
        }

        var user = await accounts.FindByIdAsync(id, cancellationToken);
        if (user is null)
        {
            return Failure<AuthUser>(StatusCodes.Status401Unauthorized, "unauthorized", "Zahtevana je prijava.");
        }

        return new AuthResult<AuthUser>.Success(ToUser(user));
    }

    private async Task<AuthSession> IssueAsync(UserAccount user, CancellationToken cancellationToken)
    {
        var refresh = await accounts.CreateRefreshAsync(
            user.Id,
            DateTimeOffset.UtcNow.AddDays(jwtOptions.Value.RefreshExpiresDays),
            cancellationToken);
        var access = tokens.Create(user.Id, user.Email, user.Name, user.Role);
        return new AuthSession(ToUser(user), new AuthTokens(access.Token, access.ExpiresAt, refresh.RawToken, refresh.ExpiresAt));
    }

    private async Task<UserAccount?> FindForLoginAsync(string? email, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        return await accounts.FindByEmailAsync(AuthValidation.NormalizeEmail(email), cancellationToken);
    }

    private static AuthUser ToUser(UserAccount user) => new(user.Id, user.Email, user.Name, user.Role);

    private static AuthResult<AuthSession> InvalidCredentials() =>
        Failure<AuthSession>(StatusCodes.Status401Unauthorized, "invalid_credentials", InvalidCredentialsMessage);

    private static AuthResult<T> Failure<T>(int statusCode, string code, string message) =>
        new AuthResult<T>.Failure(statusCode, code, message);
}
