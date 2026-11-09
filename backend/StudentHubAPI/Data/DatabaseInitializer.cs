using DbUp;
using Microsoft.Extensions.Configuration;

namespace StudentHubAPI.Data;

public sealed class DatabaseInitializer(IConfiguration configuration)
{
    public void Apply()
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' is missing.");

        EnsureDatabase.For.PostgresqlDatabase(connectionString);

        var upgrader = DeployChanges.To
            .PostgresqlDatabase(connectionString)
            .WithScriptsEmbeddedInAssembly(typeof(DatabaseInitializer).Assembly, s => s.EndsWith(".sql"))
            .LogToConsole()
            .Build();

        var result = upgrader.PerformUpgrade();

        if (!result.Successful)
        {
            throw new Exception("Migracije baze niso uspele.", result.Error);
        }
    }
}
