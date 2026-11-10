using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.SignalR;
using StudentHubAPI.Handlers;
using StudentHubAPI.Hubs;
using StudentHubAPI.Models.Dtos;
using StudentHubAPI.Services;

namespace StudentHubAPI.Endpoints;

public static class QaEndpoints
{
    public static IEndpointRouteBuilder MapQaEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api").RequireAuthorization();

        group.MapGet("/courses/{courseId:int}/questions", async (int courseId, QaHandler handler, CancellationToken ct) =>
        {
            var questions = await handler.GetQuestionsForCourseAsync(courseId, ct);
            return Results.Ok(questions);
        });

        group.MapPost("/courses/{courseId:int}/questions", async (int courseId, CreateQuestionRequest req, ClaimsPrincipal user, QaHandler handler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Content))
                return Results.BadRequest(new { message = "Naslov in vsebina vprašanja sta obvezna." });

            var question = await handler.CreateQuestionAsync(courseId, userId, req, ct);
            return Results.Ok(question);
        });

        group.MapGet("/questions/{questionId:int}", async (int questionId, QaHandler handler, CancellationToken ct) =>
        {
            var detail = await handler.GetQuestionDetailAsync(questionId, ct);
            return detail is not null ? Results.Ok(detail) : Results.NotFound();
        });

        group.MapPost("/questions/{questionId:int}/answers", async (
            int questionId, CreateAnswerRequest req, ClaimsPrincipal user,
            QaHandler handler, IHubContext<QaHub> hubContext, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            if (string.IsNullOrWhiteSpace(req.Content))
                return Results.BadRequest(new { message = "Vsebina odgovora ne sme biti prazna." });

            var answer = await handler.AddAnswerAsync(questionId, userId, req.Content, req.ParentAnswerId, ct);
            await hubContext.Clients.Group($"question-{questionId}").SendAsync("ReceiveAnswer", answer, ct);
            return Results.Ok(answer);
        });

        group.MapDelete("/questions/{questionId:int}", async (
            int questionId, ClaimsPrincipal user, QaHandler handler, ModerationHandler modHandler, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var meta = await handler.GetQuestionMetaAsync(questionId, ct);
            if (meta is null) return Results.NotFound();

            var isAuthor = meta.Value.AuthorId == userId;
            var isMod = await modHandler.IsModeratorForCourseAsync(userId, meta.Value.CourseId, ct);
            if (!isAuthor && !isMod) return Results.Forbid();

            await handler.DeleteQuestionAsync(questionId, ct);
            return Results.NoContent();
        });

        group.MapDelete("/answers/{answerId:int}", async (
            int answerId, ClaimsPrincipal user, QaHandler handler, ModerationHandler modHandler,
            IHubContext<QaHub> hubContext, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId)) return Results.Unauthorized();
            var meta = await handler.GetAnswerMetaAsync(answerId, ct);
            if (meta is null) return Results.NotFound();

            var isAuthor = meta.Value.AuthorId == userId;
            var isMod = await modHandler.IsModeratorForCourseAsync(userId, meta.Value.CourseId, ct);
            if (!isAuthor && !isMod) return Results.Forbid();

            await handler.DeleteAnswerAsync(answerId, ct);
            await hubContext.Clients.Group($"question-{meta.Value.QuestionId}").SendAsync("DeleteAnswer", answerId, ct);
            return Results.NoContent();
        });

        return routes;
    }
}
