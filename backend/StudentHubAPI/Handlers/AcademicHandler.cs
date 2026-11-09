using Dapper;
using StudentHubAPI.Data;
using StudentHubAPI.Models.Dtos;
using StudentHubAPI.Models;

namespace StudentHubAPI.Handlers;

public sealed class AcademicHandler(IDbConnectionFactory connections)
{
    public async Task<List<FacultyDto>> GetFacultiesAsync(CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = "SELECT id as Id, ime as Ime, univerza as Univerza, sedez as Sedez, leto_ustanovitve as LetoUstanovitve FROM fakulteta ORDER BY ime";
        var faculties = await connection.QueryAsync<Fakulteta>(new CommandDefinition(query, cancellationToken: cancellationToken));
        
        return faculties.Select(f => new FacultyDto(f.Id, f.Ime, f.Univerza, f.Sedez, f.LetoUstanovitve)).ToList();
    }

    public async Task<List<ProgramDto>> GetProgramsAsync(int facultyId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = "SELECT id as Id, ime as Ime, fakulteta_id as FakultetaId, trajanje_let as TrajanjeLet, stopnja as Stopnja FROM smer WHERE fakulteta_id = @FacultyId ORDER BY ime";
        var programs = await connection.QueryAsync<Smer>(new CommandDefinition(query, new { FacultyId = facultyId }, cancellationToken: cancellationToken));
        
        return programs.Select(p => new ProgramDto(p.Id, p.Ime, p.FakultetaId, p.TrajanjeLet, p.Stopnja)).ToList();
    }

    public async Task<List<CourseDto>> GetCoursesAsync(int programId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = "SELECT id as Id, ime as Ime, smer_id as SmerId, letnik as Letnik, nosilec as Nosilec, ects as Ects, semester as Semester FROM predmet WHERE smer_id = @ProgramId ORDER BY letnik, ime";
        var courses = await connection.QueryAsync<Predmet>(new CommandDefinition(query, new { ProgramId = programId }, cancellationToken: cancellationToken));
        
        return courses.Select(c => new CourseDto(c.Id, c.Ime, c.SmerId, c.Letnik, c.Nosilec, c.Ects, c.Semester)).ToList();
    }

    public async Task<List<CourseDto>> SearchCoursesAsync(string queryText, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = "SELECT id as Id, ime as Ime, smer_id as SmerId, letnik as Letnik, nosilec as Nosilec, ects as Ects, semester as Semester FROM predmet WHERE ime ILIKE @Query ORDER BY ime LIMIT 50";
        var courses = await connection.QueryAsync<Predmet>(new CommandDefinition(query, new { Query = $"%{queryText}%" }, cancellationToken: cancellationToken));
        
        return courses.Select(c => new CourseDto(c.Id, c.Ime, c.SmerId, c.Letnik, c.Nosilec, c.Ects, c.Semester)).ToList();
    }
}
