namespace StudentHubAPI.Models;

public sealed record RegisterRequest(string? Email, string? Password, string? Name);
public sealed record LoginRequest(string? Email, string? Password);
public sealed record RefreshRequest(string? RefreshToken);
public sealed record LogoutRequest(string? RefreshToken);

public sealed record AuthUser(int Id, string Email, string Name, string Role);

public sealed record AuthTokens(
    string AccessToken,
    DateTimeOffset AccessTokenExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt);

public sealed record AuthSession(AuthUser User, AuthTokens Tokens);

public sealed record ApiError(string Code, string Message);

public abstract record AuthResult<T>
{
    public sealed record Success(T Value) : AuthResult<T>;

    public sealed record Failure(int StatusCode, string Code, string Message) : AuthResult<T>;
}
