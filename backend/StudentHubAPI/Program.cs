using System.Net.Http.Headers;
using Dapper;
using StudentHubAPI.Data;
using StudentHubAPI.Endpoints;
using StudentHubAPI.Handlers;
using StudentHubAPI.Hubs;
using StudentHubAPI.Services;

SqlMapper.AddTypeHandler(new TimeOnlyHandler());

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
builder.Services.AddSingleton<PasswordHasher>();
builder.Services.AddScoped<DatabaseInitializer>();

builder.Services.AddScoped<AuthRepository>();
builder.Services.AddScoped<AuthHandler>();
builder.Services.AddScoped<AcademicHandler>();
builder.Services.AddScoped<UserProfileHandler>();
builder.Services.AddScoped<MaterialHandler>();
builder.Services.AddScoped<ModerationHandler>();
builder.Services.AddScoped<QaHandler>();
builder.Services.AddScoped<CalendarHandler>();
builder.Services.AddScoped<ScheduleHandler>();
builder.Services.AddSignalR();

var supabaseOptions = builder.Configuration.GetSection(SupabaseOptions.SectionName).Get<SupabaseOptions>() ?? new SupabaseOptions();
builder.Services.AddSingleton(supabaseOptions);
builder.Services.AddHttpClient<SupabaseStorageService>(client => ConfigureSupabaseClient(supabaseOptions, client));

builder.Services.AddJwtAuthentication(builder.Configuration);

var app = builder.Build();

InitializeDatabase(app);

app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapAcademicEndpoints();
app.MapUserProfileEndpoints();
app.MapMaterialEndpoints();
app.MapModerationEndpoints();
app.MapQaEndpoints();
app.MapCalendarEndpoints();
app.MapScheduleEndpoints();
app.MapHub<QaHub>("/hubs/qa");
app.MapGet("/", () => "StudentHub API");

app.Run();

static void InitializeDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
    initializer.Apply();
}

static void ConfigureSupabaseClient(SupabaseOptions options, HttpClient client)
{
    if (Uri.TryCreate(options.Url, UriKind.Absolute, out var uri))
        client.BaseAddress = uri;

    if (string.IsNullOrWhiteSpace(options.Key))
        return;

    client.DefaultRequestHeaders.TryAddWithoutValidation("apikey", options.Key);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", options.Key);
}
