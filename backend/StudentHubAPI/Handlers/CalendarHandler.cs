using Dapper;
using StudentHubAPI.Data;
using StudentHubAPI.Models.Dtos;

namespace StudentHubAPI.Handlers;

public sealed class CalendarHandler(IDbConnectionFactory connections)
{
    public async Task<List<ObligationDto>> GetObligationsForCourseAsync(int courseId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = @"
            SELECT o.id as Id, o.predmet_id as CourseId, o.uporabnik_id as AuthorId,
                   COALESCE(u.ime, 'Neznan avtor') as AuthorName,
                   o.naslov as Title, o.tip as Type, o.datum as Date, o.opis as Description,
                   o.ustvarjeno_dne as CreatedAt
            FROM obveznost o
            LEFT JOIN uporabnik u ON o.uporabnik_id = u.id
            JOIN predmet current_p ON o.predmet_id = current_p.id
            JOIN predmet selected_p ON LOWER(current_p.ime) = LOWER(selected_p.ime)
            WHERE selected_p.id = @CourseId
            ORDER BY o.datum ASC";

        var obligations = await connection.QueryAsync<ObligationDto>(new CommandDefinition(query, new { CourseId = courseId }, cancellationToken: ct));
        return obligations.ToList();
    }

    public async Task<ObligationDto> CreateObligationAsync(int courseId, int userId, CreateObligationRequest req, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var insertQuery = @"
            INSERT INTO obveznost (predmet_id, uporabnik_id, naslov, tip, datum, opis)
            VALUES (@CourseId, @UserId, @Title, @Type, @Date, @Description)
            RETURNING id, ustvarjeno_dne";

        var result = await connection.QuerySingleAsync<dynamic>(new CommandDefinition(insertQuery, 
            new { CourseId = courseId, UserId = userId, Title = req.Title, Type = req.Type, Date = req.Date, Description = req.Description }, 
            cancellationToken: ct));

        var userQuery = "SELECT ime FROM uporabnik WHERE id = @UserId";
        var userName = await connection.QuerySingleAsync<string>(new CommandDefinition(userQuery, new { UserId = userId }, cancellationToken: ct));

        return new ObligationDto((int)result.id, courseId, userId, userName, req.Title, req.Type, req.Date, req.Description, (DateTime)result.ustvarjeno_dne);
    }

    public async Task<ObligationDto?> UpdateObligationAsync(int obligationId, UpdateObligationRequest req, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var updateQuery = @"
            UPDATE obveznost
            SET naslov = @Title, tip = @Type, datum = @Date, opis = @Description
            WHERE id = @ObligationId";

        var affected = await connection.ExecuteAsync(new CommandDefinition(updateQuery, 
            new { ObligationId = obligationId, Title = req.Title, Type = req.Type, Date = req.Date, Description = req.Description }, 
            cancellationToken: ct));

        if (affected == 0) return null;

        var selectQuery = @"
            SELECT o.id as Id, o.predmet_id as CourseId, o.uporabnik_id as AuthorId,
                   COALESCE(u.ime, 'Neznan avtor') as AuthorName,
                   o.naslov as Title, o.tip as Type, o.datum as Date, o.opis as Description,
                   o.ustvarjeno_dne as CreatedAt
            FROM obveznost o
            LEFT JOIN uporabnik u ON o.uporabnik_id = u.id
            WHERE o.id = @ObligationId";

        return await connection.QuerySingleOrDefaultAsync<ObligationDto>(new CommandDefinition(selectQuery, new { ObligationId = obligationId }, cancellationToken: ct));
    }

    public async Task<int?> GetObligationCourseIdAsync(int obligationId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = "SELECT predmet_id FROM obveznost WHERE id = @ObligationId";
        return await connection.ExecuteScalarAsync<int?>(new CommandDefinition(query, new { ObligationId = obligationId }, cancellationToken: ct));
    }

    public async Task DeleteObligationAsync(int obligationId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        await connection.ExecuteAsync(new CommandDefinition("DELETE FROM obveznost WHERE id = @ObligationId", new { ObligationId = obligationId }, cancellationToken: ct));
    }
}
