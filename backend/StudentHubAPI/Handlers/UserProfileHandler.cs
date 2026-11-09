using Dapper;
using StudentHubAPI.Data;
using StudentHubAPI.Models.Dtos;
using StudentHubAPI.Models;

namespace StudentHubAPI.Handlers;

public sealed class UserProfileHandler(IDbConnectionFactory connections)
{
    public async Task<UserProfileDto?> GetUserProfileAsync(int userId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        
        var userQuery = "SELECT id as Id, email as Email, ime as Name FROM uporabnik WHERE id = @UserId";
        var user = await connection.QuerySingleOrDefaultAsync<UserAccount>(new CommandDefinition(userQuery, new { UserId = userId }, cancellationToken: cancellationToken));
        
        if (user is null) return null;

        var coursesQuery = @"
            SELECT p.id as Id, p.ime as Ime, p.smer_id as SmerId, s.ime as ProgramName, p.letnik as Letnik, p.nosilec as Nosilec, p.ects as Ects, p.semester as Semester 
            FROM predmet p
            LEFT JOIN smer s ON p.smer_id = s.id
            JOIN uporabnik_predmet up ON p.id = up.predmet_id
            WHERE up.uporabnik_id = @UserId";
            
        var courses = await connection.QueryAsync<dynamic>(new CommandDefinition(coursesQuery, new { UserId = userId }, cancellationToken: cancellationToken));
        
        var courseDtos = courses.Select(c => new CourseDto(
            (int)c.id, 
            (string)c.ime, 
            c.smerid != null ? (int)c.smerid : null, 
            c.letnik != null ? (int)c.letnik : null, 
            c.nosilec as string, 
            c.ects != null ? (int)c.ects : null, 
            c.semester as string,
            c.programname as string
        )).ToList();

        return new UserProfileDto(user.Id, user.Email, user.Name, courseDtos);
    }

    public async Task UpdateUserCoursesAsync(int userId, List<int> courseIds, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        using var transaction = connection.BeginTransaction();
        
        try
        {
            var deleteQuery = "DELETE FROM uporabnik_predmet WHERE uporabnik_id = @UserId";
            await connection.ExecuteAsync(new CommandDefinition(deleteQuery, new { UserId = userId }, transaction, cancellationToken: cancellationToken));

            if (courseIds.Count > 0)
            {
                var insertQuery = "INSERT INTO uporabnik_predmet (uporabnik_id, predmet_id) VALUES (@UserId, @CourseId)";
                var parameters = courseIds.Select(id => new { UserId = userId, CourseId = id }).ToList();
                await connection.ExecuteAsync(new CommandDefinition(insertQuery, parameters, transaction, cancellationToken: cancellationToken));
            }
            
            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task RemoveUserCourseAsync(int userId, int courseId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = "DELETE FROM uporabnik_predmet WHERE uporabnik_id = @UserId AND predmet_id = @CourseId";
        await connection.ExecuteAsync(new CommandDefinition(query, new { UserId = userId, CourseId = courseId }, cancellationToken: cancellationToken));
    }
}
