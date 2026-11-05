namespace StudentHubAPI.Models;

public sealed class UserAccount
{
    public int Id { get; init; }
    public string Email { get; init; } = "";
    public string PasswordHash { get; init; } = "";
    public string Name { get; init; } = "";
    public string Role { get; init; } = "";
}

public sealed record IssuedRefreshToken(string RawToken, DateTimeOffset ExpiresAt);

public sealed record RotatedRefreshToken(int UserId, string RawToken, DateTimeOffset ExpiresAt);
