using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using StudentHubAPI.Handlers;
using StudentHubAPI.Models.Dtos;
using StudentHubAPI.Services;

namespace StudentHubAPI.Endpoints;

public static class CalendarEndpoints
{
    private static readonly HashSet<string> ValidTypes = ["Kolokvij", "Izpit", "Oddaja"];

    public static IEndpointRouteBuilder MapCalendarEndpoints(this IEndpointRouteBuilder routes)
    {
        routes.MapGet("/api/user/obligations", async (ClaimsPrincipal user, CalendarHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var obligations = await handler.GetAllObligationsForUserAsync(userId, ct);
            return Results.Ok(obligations);
        }).RequireAuthorization();

        var group = routes.MapGroup("/api/courses/{courseId:int}/obligations").RequireAuthorization();

        group.MapGet("/", async (int courseId, CalendarHandler handler, CancellationToken ct) =>
        {
            var obligations = await handler.GetObligationsForCourseAsync(courseId, ct);
            return Results.Ok(obligations);
        });

        group.MapPost("/", async (
            int courseId, CreateObligationRequest req, ClaimsPrincipal user,
            CalendarHandler handler, ModerationHandler modHandler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Type) || req.Date == default)
                return Results.BadRequest(new { message = "Naslov, tip in veljaven datum obveznosti so obvezni." });
            if (!ValidTypes.Contains(req.Type))
                return Results.BadRequest(new { message = "Neveljaven tip obveznosti. Dovoljeni tipi: Kolokvij, Izpit, Oddaja." });

            var isMod = await modHandler.IsModeratorForCourseAsync(userId, courseId, ct);
            if (!isMod) return Results.Forbid();

            var obligation = await handler.CreateObligationAsync(courseId, userId, req, ct);
            return Results.Ok(obligation);
        });

        group.MapPut("/{obligationId:int}", async (
            int courseId, int obligationId, UpdateObligationRequest req, ClaimsPrincipal user,
            CalendarHandler handler, ModerationHandler modHandler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Type) || req.Date == default)
                return Results.BadRequest(new { message = "Naslov, tip in veljaven datum so obvezni." });
            if (!ValidTypes.Contains(req.Type))
                return Results.BadRequest(new { message = "Neveljaven tip obveznosti." });

            var isMod = await modHandler.IsModeratorForCourseAsync(userId, courseId, ct);
            if (!isMod) return Results.Forbid();

            var existingCourseId = await handler.GetObligationCourseIdAsync(obligationId, ct);
            if (existingCourseId is null) return Results.NotFound();

            var updated = await handler.UpdateObligationAsync(obligationId, req, ct);
            return Results.Ok(updated);
        });

        group.MapDelete("/{obligationId:int}", async (
            int courseId, int obligationId, ClaimsPrincipal user,
            CalendarHandler handler, ModerationHandler modHandler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();

            var isMod = await modHandler.IsModeratorForCourseAsync(userId, courseId, ct);
            if (!isMod) return Results.Forbid();

            var existingCourseId = await handler.GetObligationCourseIdAsync(obligationId, ct);
            if (existingCourseId is null) return Results.NotFound();

            await handler.DeleteObligationAsync(obligationId, ct);
            return Results.NoContent();
        });

        return routes;
    }
}
