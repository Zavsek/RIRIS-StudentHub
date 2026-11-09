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
builder.Services.AddScoped<AcademicHandler>();
builder.Services.AddScoped<UserProfileHandler>();
builder.Services.AddJwtAuthentication(builder.Configuration);

var app = builder.Build();

InitializeDatabase(app);

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapAcademicEndpoints();
app.MapUserProfileEndpoints();
app.MapGet("/", () => "StudentHub API");

app.Run();

static void InitializeDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
    initializer.Apply();
}
