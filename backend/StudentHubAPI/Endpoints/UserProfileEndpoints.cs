using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using StudentHubAPI.Handlers;
using StudentHubAPI.Models.Dtos;
using StudentHubAPI.Services;

namespace StudentHubAPI.Endpoints;

public static class UserProfileEndpoints
{
    public static IEndpointRouteBuilder MapUserProfileEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/user").RequireAuthorization();

        group.MapGet("/profile", async (ClaimsPrincipal user, UserProfileHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId))
                return Results.Unauthorized();

            var profile = await handler.GetUserProfileAsync(userId, ct);
            if (profile is null) return Results.NotFound();

            return Results.Ok(profile);
        });

        group.MapPut("/courses", async (UpdateUserCoursesRequest req, ClaimsPrincipal user, UserProfileHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId))
                return Results.Unauthorized();

            await handler.UpdateUserCoursesAsync(userId, req.CourseIds, ct);
            return Results.NoContent();
        });

        return routes;
    }
}
