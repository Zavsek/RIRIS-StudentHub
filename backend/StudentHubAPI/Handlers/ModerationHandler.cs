using Dapper;
using StudentHubAPI.Data;
using StudentHubAPI.Models.Dtos;

namespace StudentHubAPI.Handlers;

public sealed class ModerationHandler(IDbConnectionFactory connections)
{
    public async Task<bool> IsModeratorForCourseAsync(int userId, int courseId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        
        var adminQuery = "SELECT 1 FROM uporabnik WHERE id = @UserId AND vloga = 'Admin'";
        var isAdmin = await connection.ExecuteScalarAsync<int?>(new CommandDefinition(adminQuery, new { UserId = userId }, cancellationToken: cancellationToken));
        if (isAdmin.HasValue) return true;

        var query = @"
            SELECT 1 
            FROM moderator_predmet mp
            JOIN predmet target ON target.id = @CourseId
            JOIN predmet mod_p ON mp.predmet_id = mod_p.id
            WHERE mp.uporabnik_id = @UserId 
              AND (mp.predmet_id = @CourseId OR LOWER(mod_p.ime) = LOWER(target.ime))
            LIMIT 1";

        var result = await connection.ExecuteScalarAsync<int?>(new CommandDefinition(query, new { UserId = userId, CourseId = courseId }, cancellationToken: cancellationToken));
        return result.HasValue;
    }

    public async Task<List<ModerationCourseDto>> GetModeratedCoursesAsync(int userId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);

        var query = @"
            SELECT p.id as Id, p.ime as Name, s.ime as ProgramName,
                   COUNT(CASE WHEN g.status = 'Cakanje' THEN 1 END) as PendingMaterialsCount,
                   COUNT(g.id) as TotalMaterialsCount
            FROM moderator_predmet mp
            JOIN predmet p ON mp.predmet_id = p.id
            LEFT JOIN smer s ON p.smer_id = s.id
            LEFT JOIN predmet sibling_p ON LOWER(sibling_p.ime) = LOWER(p.ime)
            LEFT JOIN gradivo g ON g.predmet_id = sibling_p.id
            WHERE mp.uporabnik_id = @UserId
            GROUP BY p.id, p.ime, s.ime
            ORDER BY p.ime ASC";

        var courses = await connection.QueryAsync<dynamic>(new CommandDefinition(query, new { UserId = userId }, cancellationToken: cancellationToken));
        
        return courses.Select(c => new ModerationCourseDto(
            (int)c.id,
            (string)c.name,
            c.programname as string,
            (int)c.pendingmaterialscount,
            (int)c.totalmaterialscount
        )).ToList();
    }

    public async Task AssignModeratorAsync(int courseId, int userId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = @"
            INSERT INTO moderator_predmet (uporabnik_id, predmet_id)
            VALUES (@UserId, @CourseId)
            ON CONFLICT (uporabnik_id, predmet_id) DO NOTHING";

        await connection.ExecuteAsync(new CommandDefinition(query, new { UserId = userId, CourseId = courseId }, cancellationToken: cancellationToken));
    }

    public async Task RemoveModeratorAsync(int courseId, int userId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = "DELETE FROM moderator_predmet WHERE uporabnik_id = @UserId AND predmet_id = @CourseId";
        await connection.ExecuteAsync(new CommandDefinition(query, new { UserId = userId, CourseId = courseId }, cancellationToken: cancellationToken));
    }

    public async Task<List<ModeratorUserDto>> GetModeratorsForCourseAsync(int courseId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = @"
            SELECT u.id as UserId, u.ime as Name, u.email as Email, mp.dodeljeno_dne as AssignedAt
            FROM moderator_predmet mp
            JOIN uporabnik u ON mp.uporabnik_id = u.id
            JOIN predmet p ON mp.predmet_id = p.id
            JOIN predmet target ON target.id = @CourseId
            WHERE mp.predmet_id = @CourseId OR LOWER(p.ime) = LOWER(target.ime)
            ORDER BY u.ime ASC";

        var moderators = await connection.QueryAsync<ModeratorUserDto>(new CommandDefinition(query, new { CourseId = courseId }, cancellationToken: cancellationToken));
        return moderators.ToList();
    }
}
