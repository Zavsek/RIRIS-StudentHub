using Dapper;
using StudentHubAPI.Data;
using StudentHubAPI.Models.Dtos;
using StudentHubAPI.Models;

namespace StudentHubAPI.Handlers;

public sealed class MaterialHandler(IDbConnectionFactory connections)
{
    public async Task<List<MaterialDto>> GetMaterialsForCourseAsync(int courseId, int? currentUserId = null, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        
        var query = @"
            SELECT g.id as Id, g.predmet_id as CourseId, g.uporabnik_id as AuthorId, COALESCE(u.ime, 'Neznan avtor') as AuthorName, 
                   g.naslov as Title, g.opis as Description, g.ime_datoteke as FileName, g.status as Status, g.ustvarjeno_dne as CreatedAt,
                   g.pregledal_id as ReviewedById, reviewer.ime as ReviewedByName,
                   ROUND(AVG(og.ocena)::numeric, 1)::float8 as AverageRating,
                   COUNT(og.id)::int as RatingCount,
                   MAX(CASE WHEN og.uporabnik_id = @UserId THEN og.ocena ELSE NULL END) as UserRating
            FROM gradivo g
            LEFT JOIN uporabnik u ON g.uporabnik_id = u.id
            LEFT JOIN uporabnik reviewer ON g.pregledal_id = reviewer.id
            LEFT JOIN ocena_gradiva og ON og.gradivo_id = g.id
            JOIN predmet current_p ON g.predmet_id = current_p.id
            JOIN predmet selected_p ON LOWER(current_p.ime) = LOWER(selected_p.ime)
            WHERE selected_p.id = @CourseId
            GROUP BY g.id, g.predmet_id, g.uporabnik_id, u.ime, g.naslov, g.opis, g.ime_datoteke, g.status, g.ustvarjeno_dne, g.pregledal_id, reviewer.ime
            ORDER BY g.ustvarjeno_dne DESC";
            
        var materials = await connection.QueryAsync<MaterialDto>(new CommandDefinition(query, new { CourseId = courseId, UserId = currentUserId }, cancellationToken: cancellationToken));
        return materials.ToList();
    }

    public async Task<MaterialRatingSummaryDto> RateMaterialAsync(int materialId, int userId, int rating, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);

        var upsertQuery = @"
            INSERT INTO ocena_gradiva (gradivo_id, uporabnik_id, ocena)
            VALUES (@MaterialId, @UserId, @Rating)
            ON CONFLICT (gradivo_id, uporabnik_id)
            DO UPDATE SET ocena = EXCLUDED.ocena, ustvarjeno_dne = NOW()";

        await connection.ExecuteAsync(new CommandDefinition(upsertQuery,
            new { MaterialId = materialId, UserId = userId, Rating = rating },
            cancellationToken: cancellationToken));

        var summaryQuery = @"
            SELECT @MaterialId as MaterialId,
                   ROUND(AVG(ocena)::numeric, 1)::float8 as AverageRating,
                   COUNT(id)::int as RatingCount,
                   MAX(CASE WHEN uporabnik_id = @UserId THEN ocena ELSE NULL END) as UserRating
            FROM ocena_gradiva
            WHERE gradivo_id = @MaterialId";

        return await connection.QuerySingleAsync<MaterialRatingSummaryDto>(
            new CommandDefinition(summaryQuery, new { MaterialId = materialId, UserId = userId }, cancellationToken: cancellationToken));
    }

    public async Task<bool> BelongsToCourseSubjectAsync(int materialPredmetId, int targetCourseId, CancellationToken cancellationToken = default)
    {
        if (materialPredmetId == targetCourseId) return true;

        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = @"
            SELECT 1 FROM predmet p1 
            JOIN predmet p2 ON LOWER(p1.ime) = LOWER(p2.ime) 
            WHERE p1.id = @P1 AND p2.id = @P2";

        var result = await connection.ExecuteScalarAsync<int?>(new CommandDefinition(query, new { P1 = materialPredmetId, P2 = targetCourseId }, cancellationToken: cancellationToken));
        return result.HasValue;
    }

    public async Task<MaterialDto> AddMaterialAsync(int courseId, int userId, string title, string? description, string fileName, string supabasePath, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        
        var insertQuery = @"
            INSERT INTO gradivo (predmet_id, uporabnik_id, naslov, opis, ime_datoteke, supabase_path)
            VALUES (@CourseId, @UserId, @Title, @Description, @FileName, @SupabasePath)
            RETURNING id as Id, predmet_id as PredmetId, uporabnik_id as UporabnikId, naslov as Naslov, opis as Opis, 
                      ime_datoteke as ImeDatoteke, supabase_path as SupabasePath, status as Status, pregledal_id as PregledalId, ustvarjeno_dne as UstvarjenoDne";
                      
        var gradivo = await connection.QuerySingleAsync<Gradivo>(new CommandDefinition(insertQuery, 
            new { CourseId = courseId, UserId = userId, Title = title, Description = description, FileName = fileName, SupabasePath = supabasePath }, 
            cancellationToken: cancellationToken));

        var userQuery = "SELECT ime as Name FROM uporabnik WHERE id = @UserId";
        var userName = await connection.QuerySingleAsync<string>(new CommandDefinition(userQuery, new { UserId = userId }, cancellationToken: cancellationToken));

        return new MaterialDto(gradivo.Id, gradivo.PredmetId, gradivo.UporabnikId, userName, gradivo.Naslov, gradivo.Opis, gradivo.ImeDatoteke, gradivo.Status, gradivo.UstvarjenoDne);
    }

    public async Task<string?> GetMaterialSupabasePathAsync(int materialId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = "SELECT supabase_path FROM gradivo WHERE id = @MaterialId";
        return await connection.QuerySingleOrDefaultAsync<string>(new CommandDefinition(query, new { MaterialId = materialId }, cancellationToken: cancellationToken));
    }
    
    public async Task<Gradivo?> GetMaterialAsync(int materialId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = @"
            SELECT id as Id, predmet_id as PredmetId, uporabnik_id as UporabnikId, naslov as Naslov, opis as Opis, 
                   ime_datoteke as ImeDatoteke, supabase_path as SupabasePath, status as Status, pregledal_id as PregledalId, ustvarjeno_dne as UstvarjenoDne 
            FROM gradivo WHERE id = @MaterialId";
        return await connection.QuerySingleOrDefaultAsync<Gradivo>(new CommandDefinition(query, new { MaterialId = materialId }, cancellationToken: cancellationToken));
    }

    public async Task<MaterialDto?> UpdateMaterialStatusAsync(int materialId, string status, int moderatorUserId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var updateQuery = "UPDATE gradivo SET status = @Status, pregledal_id = @ModeratorUserId WHERE id = @MaterialId";
        
        var affected = await connection.ExecuteAsync(new CommandDefinition(updateQuery, 
            new { MaterialId = materialId, Status = status, ModeratorUserId = moderatorUserId }, 
            cancellationToken: cancellationToken));
        
        if (affected == 0) return null;

        var selectQuery = @"
            SELECT g.id as Id, g.predmet_id as CourseId, g.uporabnik_id as AuthorId, COALESCE(u.ime, 'Neznan avtor') as AuthorName,
                   g.naslov as Title, g.opis as Description, g.ime_datoteke as FileName, g.status as Status, g.ustvarjeno_dne as CreatedAt,
                   g.pregledal_id as ReviewedById, reviewer.ime as ReviewedByName
            FROM gradivo g
            LEFT JOIN uporabnik u ON g.uporabnik_id = u.id
            LEFT JOIN uporabnik reviewer ON g.pregledal_id = reviewer.id
            WHERE g.id = @MaterialId";

        return await connection.QuerySingleOrDefaultAsync<MaterialDto>(new CommandDefinition(selectQuery, new { MaterialId = materialId }, cancellationToken: cancellationToken));
    }

    public async Task DeleteMaterialAsync(int materialId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = "DELETE FROM gradivo WHERE id = @MaterialId";
        await connection.ExecuteAsync(new CommandDefinition(query, new { MaterialId = materialId }, cancellationToken: cancellationToken));
    }
}
