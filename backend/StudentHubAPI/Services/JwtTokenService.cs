using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace StudentHubAPI.Services;

public static class UserRoles
{
    public const string Student = "Student";
    public const string Moderator = "Moderator";
    public const string Admin = "Admin";
}

public static class AuthUserId
{
    public const string ClaimType = JwtRegisteredClaimNames.Sub;

    public static bool TryRead(ClaimsPrincipal principal, out int userId)
    {
        var value = principal.FindFirst(ClaimType)?.Value;
        return int.TryParse(value, out userId);
    }
}

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; init; } = "";
    public string Audience { get; init; } = "";
    public string Key { get; init; } = "";
    public int ExpiresMinutes { get; init; } = 60;
    public int RefreshExpiresDays { get; init; } = 14;
}

public sealed record AccessToken(string Token, DateTimeOffset ExpiresAt);

public sealed class JwtTokenService(IOptions<JwtOptions> jwtOptions)
{
    private readonly JwtOptions _options = jwtOptions.Value;

    public AccessToken Create(int userId, string email, string name, string role)
    {
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_options.ExpiresMinutes);
        var claims = new List<Claim>
        {
            new(AuthUserId.ClaimType, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new("name", name),
            new("role", role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);

        var handler = new JwtSecurityTokenHandler();
        handler.OutboundClaimTypeMap.Clear();
        return new AccessToken(handler.WriteToken(token), expiresAt);
    }
}

public static class JwtAuthentication
{
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .Validate(static options => !string.IsNullOrWhiteSpace(options.Issuer), "Jwt:Issuer is missing.")
            .Validate(static options => !string.IsNullOrWhiteSpace(options.Audience), "Jwt:Audience is missing.")
            .Validate(static options => options.Key.Length >= 32, "Jwt:Key must be at least 32 characters.")
            .Validate(static options => options.ExpiresMinutes is >= 5 and <= 120, "Jwt:ExpiresMinutes must be between 5 and 120.")
            .Validate(static options => options.RefreshExpiresDays is >= 1 and <= 30, "Jwt:RefreshExpiresDays must be between 1 and 30.")
            .ValidateOnStart();

        var jwt = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Jwt configuration is missing.");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(bearer =>
            {
                bearer.MapInboundClaims = false;
                bearer.TokenValidationParameters = CreateValidationParameters(jwt);
            });

        services.AddAuthorization(AddRolePolicies);
        services.AddSingleton<JwtTokenService>();
        return services;
    }

    private static TokenValidationParameters CreateValidationParameters(JwtOptions jwt) => new()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwt.Issuer,
        ValidAudience = jwt.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
        ClockSkew = TimeSpan.FromMinutes(1),
        RoleClaimType = "role",
        NameClaimType = "name",
        ValidAlgorithms = [SecurityAlgorithms.HmacSha256]
    };

    private static void AddRolePolicies(AuthorizationOptions options)
    {
        options.AddPolicy(UserRoles.Student, policy => policy.RequireRole(UserRoles.Student));
        options.AddPolicy(UserRoles.Moderator, policy => policy.RequireRole(UserRoles.Moderator));
        options.AddPolicy(UserRoles.Admin, policy => policy.RequireRole(UserRoles.Admin));
    }
}
