using StudentHubAPI.Data;
using StudentHubAPI.Endpoints;
using StudentHubAPI.Handlers;
using StudentHubAPI.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddScoped<DatabaseInitializer>();
builder.Services.AddScoped<AuthRepository>();
builder.Services.AddScoped<AuthHandler>();
builder.Services.AddJwtAuthentication(builder.Configuration);

var app = builder.Build();

await InitializeDatabaseAsync(app);

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapGet("/", () => "StudentHub API");

app.Run();

static async Task InitializeDatabaseAsync(WebApplication app)
{
    await using var scope = app.Services.CreateAsyncScope();
    var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
    await initializer.ApplyAsync();
}
