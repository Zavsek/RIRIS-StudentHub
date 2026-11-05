using System.Security.Claims;
using StudentHubAPI.Handlers;
using StudentHubAPI.Models;

namespace StudentHubAPI.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth");
        group.MapPost("/register", Register);
        group.MapPost("/login", Login);
        group.MapPost("/refresh", Refresh);
        group.MapPost("/logout", Logout);
        group.MapGet("/me", Me).RequireAuthorization();
    }

    private static async Task<IResult> Register(
        RegisterRequest? request,
        AuthHandler handler,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return MissingBody();
        }

        return ToResult(await handler.RegisterAsync(request, cancellationToken));
    }

    private static async Task<IResult> Login(
        LoginRequest? request,
        AuthHandler handler,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return MissingBody();
        }

        return ToResult(await handler.LoginAsync(request, cancellationToken));
    }

    private static async Task<IResult> Refresh(
        RefreshRequest? request,
        AuthHandler handler,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return MissingBody();
        }

        return ToResult(await handler.RefreshAsync(request, cancellationToken));
    }

    private static async Task<IResult> Logout(
        LogoutRequest? request,
        AuthHandler handler,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return MissingBody();
        }

        await handler.LogoutAsync(request, cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> Me(
        ClaimsPrincipal user,
        AuthHandler handler,
        CancellationToken cancellationToken)
    {
        return ToResult(await handler.GetCurrentUserAsync(user, cancellationToken));
    }

    private static IResult MissingBody() =>
        Results.Json(new ApiError("validation", "Telo zahtevka je prazno."), statusCode: StatusCodes.Status400BadRequest);

    private static IResult ToResult<T>(AuthResult<T> result)
    {
        return result switch
        {
            AuthResult<T>.Success success => Results.Ok(success.Value),
            AuthResult<T>.Failure failure => Results.Json(
                new ApiError(failure.Code, failure.Message),
                statusCode: failure.StatusCode),
            _ => throw new InvalidOperationException("Neznan rezultat avtentikacije.")
        };
    }
}
