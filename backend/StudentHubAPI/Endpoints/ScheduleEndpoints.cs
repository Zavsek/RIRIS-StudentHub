using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using StudentHubAPI.Handlers;
using StudentHubAPI.Models.Dtos;
using StudentHubAPI.Services;

namespace StudentHubAPI.Endpoints;

public static class ScheduleEndpoints
{
    public static IEndpointRouteBuilder MapScheduleEndpoints(this IEndpointRouteBuilder routes)
    {
        MapPersonalScheduleRoutes(routes);
        MapCourseTermsRoutes(routes);
        MapComparisonRoutes(routes);
        return routes;
    }

    private static void MapPersonalScheduleRoutes(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/schedule").RequireAuthorization();

        group.MapGet("/", async (ClaimsPrincipal user, ScheduleHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var entries = await handler.GetUserScheduleAsync(userId, ct);
            return Results.Ok(entries);
        });

        group.MapPost("/", async (CreateScheduleEntryRequest req, ClaimsPrincipal user, ScheduleHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(req.Title))
                return Results.BadRequest(new { message = "Naziv termina je obvezen." });
            if (req.DayOfWeek is < 1 or > 7)
                return Results.BadRequest(new { message = "Dan v tednu mora biti med 1 (ponedeljek) in 7 (nedelja)." });
            if (!TimeOnly.TryParse(req.StartTime, out var s) || !TimeOnly.TryParse(req.EndTime, out var e) || e <= s)
                return Results.BadRequest(new { message = "Čas 'do' mora biti večji od časa 'od'." });

            var created = await handler.CreateScheduleEntryAsync(userId, req, ct);
            return Results.Ok(created);
        });

        group.MapDelete("/{id:int}", async (int id, ClaimsPrincipal user, ScheduleHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var deleted = await handler.DeleteScheduleEntryAsync(id, userId, ct);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        group.MapPost("/import-term/{courseTermId:int}", async (int courseTermId, ClaimsPrincipal user, ScheduleHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var entry = await handler.ImportCourseTermAsync(userId, courseTermId, ct);
            return entry != null ? Results.Ok(entry) : Results.NotFound(new { message = "Termin predmeta ne obstaja." });
        });

        group.MapGet("/colleagues", async (ClaimsPrincipal user, ScheduleHandler handler, int? courseId, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var colleagues = await handler.GetColleaguesAsync(userId, courseId, ct);
            return Results.Ok(colleagues);
        });

        group.MapPost("/compare-weekly", async (CompareWeeklyScheduleRequest req, ClaimsPrincipal user, ScheduleHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out _)) return Results.Unauthorized();
            if (req.UserIds == null || req.UserIds.Distinct().Count() < 2)
                return Results.BadRequest(new { message = "Izbrati morate vsaj dva uporabnika za primerjavo." });

            var result = await handler.CompareWeeklyScheduleAsync(req.UserIds, ct);
            return Results.Ok(result);
        });
    }

    private static void MapCourseTermsRoutes(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/courses/{courseId:int}/terms").RequireAuthorization();

        group.MapGet("/", async (int courseId, ClaimsPrincipal user, ScheduleHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var terms = await handler.GetCourseTermsAsync(courseId, userId, ct);
            return Results.Ok(terms);
        });

        group.MapPost("/", async (int courseId, CreateCourseTermRequest req, ClaimsPrincipal user,
            ScheduleHandler handler, ModerationHandler modHandler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(req.Title))
                return Results.BadRequest(new { message = "Naziv termina je obvezen." });
            if (req.DayOfWeek is < 1 or > 7)
                return Results.BadRequest(new { message = "Dan v tednu mora biti med 1 in 7." });
            if (!TimeOnly.TryParse(req.StartTime, out var s) || !TimeOnly.TryParse(req.EndTime, out var e) || e <= s)
                return Results.BadRequest(new { message = "Čas 'do' mora biti večji od časa 'od'." });

            var isMod = await modHandler.IsModeratorForCourseAsync(userId, courseId, ct);
            if (!isMod) return Results.Forbid();

            var term = await handler.CreateCourseTermAsync(courseId, userId, req, ct);
            return Results.Ok(term);
        });

        group.MapDelete("/{termId:int}", async (int courseId, int termId, ClaimsPrincipal user,
            ScheduleHandler handler, ModerationHandler modHandler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var isMod = await modHandler.IsModeratorForCourseAsync(userId, courseId, ct);
            if (!isMod) return Results.Forbid();

            var deleted = await handler.DeleteCourseTermAsync(termId, ct);
            return deleted ? Results.NoContent() : Results.NotFound();
        });
    }

    private static void MapComparisonRoutes(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/courses/{courseId:int}").RequireAuthorization();

        group.MapGet("/students", async (int courseId, ClaimsPrincipal user, ScheduleHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var students = await handler.GetEnrolledStudentsAsync(courseId, userId, ct);
            return Results.Ok(students);
        });

        group.MapPost("/schedule/compare", async (int courseId, CompareFreeTimeRequest req, ClaimsPrincipal user,
            ScheduleHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out _)) return Results.Unauthorized();
            if (req.UserIds == null || req.UserIds.Distinct().Count() < 2)
                return Results.BadRequest(new { message = "Izbrati morate vsaj dva uporabnika za primerjavo." });
            if (req.DayOfWeek is < 1 or > 7)
                return Results.BadRequest(new { message = "Dan v tednu mora biti med 1 in 7." });

            var validUsers = await handler.ValidateUsersEnrolledInCourseAsync(courseId, req.UserIds, ct);
            if (!validUsers)
                return Results.BadRequest(new { message = "Vsi izbrani uporabniki morajo imeti aktiven izbrani predmet." });

            var freeIntervals = await handler.CompareFreeTimeAsync(courseId, req, ct);
            return Results.Ok(freeIntervals);
        });
    }
}
