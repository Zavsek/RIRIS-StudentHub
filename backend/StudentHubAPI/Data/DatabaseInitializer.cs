using Dapper;

namespace StudentHubAPI.Data;

public sealed class DatabaseInitializer(IDbConnectionFactory connections, IWebHostEnvironment environment)
{
    public async Task ApplyAsync(CancellationToken cancellationToken = default)
    {
        var path = Path.Combine(environment.ContentRootPath, "Data", "Schema", "auth.sql");
        if (!File.Exists(path))
        {
            throw new FileNotFoundException("Manjka shema za avtentikacijo.", path);
        }

        var sql = await File.ReadAllTextAsync(path, cancellationToken);
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var command = new CommandDefinition(sql, cancellationToken: cancellationToken);
        await connection.ExecuteAsync(command);
    }
}
