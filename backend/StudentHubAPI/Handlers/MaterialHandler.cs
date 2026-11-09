using Dapper;
using StudentHubAPI.Data;
using StudentHubAPI.Models.Dtos;
using StudentHubAPI.Models;

namespace StudentHubAPI.Handlers;

public sealed class MaterialHandler(IDbConnectionFactory connections)
{
    public async Task<List<MaterialDto>> GetMaterialsForCourseAsync(int courseId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        
        var query = @"
            SELECT g.id as Id, g.predmet_id as CourseId, g.uporabnik_id as AuthorId, u.ime as AuthorName, 
                   g.naslov as Title, g.opis as Description, g.ime_datoteke as FileName, g.status as Status, g.ustvarjeno_dne as CreatedAt
            FROM gradivo g
            JOIN uporabnik u ON g.uporabnik_id = u.id
            WHERE g.predmet_id = @CourseId
            ORDER BY g.ustvarjeno_dne DESC";
            
        var materials = await connection.QueryAsync<MaterialDto>(new CommandDefinition(query, new { CourseId = courseId }, cancellationToken: cancellationToken));
        
        return materials.ToList();
    }

    public async Task<MaterialDto> AddMaterialAsync(int courseId, int userId, string title, string? description, string fileName, string supabasePath, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        
        var insertQuery = @"
            INSERT INTO gradivo (predmet_id, uporabnik_id, naslov, opis, ime_datoteke, supabase_path)
            VALUES (@CourseId, @UserId, @Title, @Description, @FileName, @SupabasePath)
            RETURNING id as Id, predmet_id as PredmetId, uporabnik_id as UporabnikId, naslov as Naslov, opis as Opis, 
                      ime_datoteke as ImeDatoteke, supabase_path as SupabasePath, status as Status, ustvarjeno_dne as UstvarjenoDne";
                      
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
        var query = "SELECT id as Id, predmet_id as PredmetId, uporabnik_id as UporabnikId, naslov as Naslov, opis as Opis, ime_datoteke as ImeDatoteke, supabase_path as SupabasePath, status as Status, ustvarjeno_dne as UstvarjenoDne FROM gradivo WHERE id = @MaterialId";
        return await connection.QuerySingleOrDefaultAsync<Gradivo>(new CommandDefinition(query, new { MaterialId = materialId }, cancellationToken: cancellationToken));
    }

    public async Task DeleteMaterialAsync(int materialId, CancellationToken cancellationToken = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(cancellationToken);
        var query = "DELETE FROM gradivo WHERE id = @MaterialId";
        await connection.ExecuteAsync(new CommandDefinition(query, new { MaterialId = materialId }, cancellationToken: cancellationToken));
    }
}
