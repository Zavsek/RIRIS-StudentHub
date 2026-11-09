using System.Security.Claims;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using StudentHubAPI.Handlers;
using StudentHubAPI.Services;

namespace StudentHubAPI.Endpoints;

public static class MaterialEndpoints
{
    public static IEndpointRouteBuilder MapMaterialEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/courses/{courseId:int}/materials").RequireAuthorization();

        group.MapGet("/", async (int courseId, MaterialHandler handler, CancellationToken ct) =>
        {
            var materials = await handler.GetMaterialsForCourseAsync(courseId, ct);
            return Results.Ok(materials);
        });

        group.MapPost("/", async (
            int courseId, 
            [FromForm] string title, 
            [FromForm] string? description, 
            IFormFile file, 
            ClaimsPrincipal user, 
            MaterialHandler dbHandler, 
            SupabaseStorageService storage, 
            CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId))
                return Results.Unauthorized();

            if (file.Length == 0) return Results.BadRequest(new { message = "Datoteka je prazna." });
            if (file.ContentType != "application/pdf") return Results.BadRequest(new { message = "Dovoljene so samo PDF datoteke." });
            
            // Limit prevelikih datotek (npr. 15MB max)
            if (file.Length > 10 * 1024 * 1024) return Results.BadRequest(new { message = "Datoteka je prevelika (max 10MB)." });

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms, ct);
            var fileBytes = ms.ToArray();

            var supabasePath = await storage.UploadFileAsync(file.FileName, fileBytes, ct);
            
            var material = await dbHandler.AddMaterialAsync(courseId, userId, title, description, file.FileName, supabasePath, ct);
            
            return Results.Ok(material);
        }).DisableAntiforgery(); // Potrebno za multipart/form-data upload

        group.MapGet("/{materialId:int}/download", async (int courseId, int materialId, MaterialHandler dbHandler, SupabaseStorageService storage, CancellationToken ct) =>
        {
            var material = await dbHandler.GetMaterialAsync(materialId, ct);
            if (material is null || material.PredmetId != courseId) return Results.NotFound(new { message = "Gradivo ne obstaja." });

            var fileBytes = await storage.DownloadFileAsync(material.SupabasePath, ct);
            if (fileBytes is null) return Results.NotFound(new { message = "Datoteka ne obstaja na strežniku." });

            return Results.File(fileBytes, "application/pdf", material.ImeDatoteke);
        });

        group.MapDelete("/{materialId:int}", async (int courseId, int materialId, ClaimsPrincipal user, MaterialHandler dbHandler, SupabaseStorageService storage, CancellationToken ct) =>
        {
            if (!AuthUserId.TryRead(user, out var userId))
                return Results.Unauthorized();

            var material = await dbHandler.GetMaterialAsync(materialId, ct);
            if (material is null || material.PredmetId != courseId) return Results.NotFound();

            if (material.UporabnikId != userId) // Trenutno lahko briše samo avtor
                return Results.Forbid();

            await storage.DeleteFileAsync(material.SupabasePath, ct);
            await dbHandler.DeleteMaterialAsync(materialId, ct);
            
            return Results.NoContent();
        });

        return routes;
    }
}
