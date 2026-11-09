using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using StudentHubAPI.Handlers;

namespace StudentHubAPI.Endpoints;

public static class AcademicEndpoints
{
    public static IEndpointRouteBuilder MapAcademicEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/academic");

        group.MapGet("/faculties", async (AcademicHandler handler, CancellationToken ct) =>
        {
            var faculties = await handler.GetFacultiesAsync(ct);
            return Results.Ok(faculties);
        });

        group.MapGet("/programs/{facultyId:int}", async (int facultyId, AcademicHandler handler, CancellationToken ct) =>
        {
            var programs = await handler.GetProgramsAsync(facultyId, ct);
            return Results.Ok(programs);
        });

        group.MapGet("/courses/{programId:int}", async (int programId, AcademicHandler handler, CancellationToken ct) =>
        {
            var courses = await handler.GetCoursesAsync(programId, ct);
            return Results.Ok(courses);
        });

        return routes;
    }
}
