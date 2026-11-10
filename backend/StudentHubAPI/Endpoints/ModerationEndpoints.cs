using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using StudentHubAPI.Handlers;
using StudentHubAPI.Models.Dtos;
using StudentHubAPI.Services;

namespace StudentHubAPI.Endpoints;

public static class ModerationEndpoints
{
    private static readonly HashSet<string> ValidStatuses = ["Cakanje", "Priporoceno", "Nepriporoceno"];

    public static IEndpointRouteBuilder MapModerationEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api").RequireAuthorization();

        group.MapGet("/moderation/courses", async (ClaimsPrincipal user, ModerationHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var courses = await handler.GetModeratedCoursesAsync(userId, ct);
            return Results.Ok(courses);
        });

        group.MapGet("/courses/{courseId:int}/moderation/check", async (int courseId, ClaimsPrincipal user, ModerationHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var isMod = await handler.IsModeratorForCourseAsync(userId, courseId, ct);
            return Results.Ok(new ModeratorStatusDto(isMod));
        });

        group.MapPatch("/courses/{courseId:int}/materials/{materialId:int}/status", async (
            int courseId, int materialId, UpdateMaterialStatusRequest req, ClaimsPrincipal user,
            ModerationHandler modHandler, MaterialHandler matHandler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            if (!ValidStatuses.Contains(req.Status))
                return Results.BadRequest(new { message = "Neveljaven status gradiva. Dovoljeni statusi: Cakanje, Priporoceno, Nepriporoceno." });

            var isMod = await modHandler.IsModeratorForCourseAsync(userId, courseId, ct);
            if (!isMod) return Results.Forbid();

            var material = await matHandler.GetMaterialAsync(materialId, ct);
            if (material is null || !await matHandler.BelongsToCourseSubjectAsync(material.PredmetId, courseId, ct))
                return Results.NotFound(new { message = "Gradivo ne obstaja za ta predmet." });

            var updated = await matHandler.UpdateMaterialStatusAsync(materialId, req.Status, userId, ct);
            return Results.Ok(updated);
        });

        group.MapGet("/courses/{courseId:int}/moderators", async (int courseId, ModerationHandler handler, CancellationToken ct) =>
        {
            var moderators = await handler.GetModeratorsForCourseAsync(courseId, ct);
            return Results.Ok(moderators);
        });

        group.MapPost("/courses/{courseId:int}/moderators", async (int courseId, AssignModeratorRequest req, ModerationHandler handler, CancellationToken ct) =>
        {
            await handler.AssignModeratorAsync(courseId, req.UserId, ct);
            return Results.NoContent();
        });

        group.MapDelete("/courses/{courseId:int}/moderators/{targetUserId:int}", async (int courseId, int targetUserId, ModerationHandler handler, CancellationToken ct) =>
        {
            await handler.RemoveModeratorAsync(courseId, targetUserId, ct);
            return Results.NoContent();
        });

        return routes;
    }
}
