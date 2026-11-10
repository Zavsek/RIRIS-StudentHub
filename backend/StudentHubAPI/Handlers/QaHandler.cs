using Dapper;
using StudentHubAPI.Data;
using StudentHubAPI.Models.Dtos;

namespace StudentHubAPI.Handlers;

public sealed class QaHandler(IDbConnectionFactory connections)
{
    public async Task<List<QuestionDto>> GetQuestionsForCourseAsync(int courseId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = @"
            SELECT v.id as Id, v.predmet_id as CourseId, v.gradivo_id as MaterialId, g.naslov as MaterialTitle,
                   v.uporabnik_id as AuthorId, COALESCE(u.ime, 'Neznan avtor') as AuthorName,
                   v.naslov as Title, v.vsebina as Content,
                   COUNT(o.id)::int as AnswersCount, v.ustvarjeno_dne as CreatedAt
            FROM vprasanje v
            LEFT JOIN gradivo g ON v.gradivo_id = g.id
            LEFT JOIN uporabnik u ON v.uporabnik_id = u.id
            LEFT JOIN odgovor o ON v.id = o.vprasanje_id
            JOIN predmet current_p ON v.predmet_id = current_p.id
            JOIN predmet selected_p ON LOWER(current_p.ime) = LOWER(selected_p.ime)
            WHERE selected_p.id = @CourseId
            GROUP BY v.id, v.predmet_id, v.gradivo_id, g.naslov, v.uporabnik_id, u.ime, v.naslov, v.vsebina, v.ustvarjeno_dne
            ORDER BY v.ustvarjeno_dne DESC";

        var questions = await connection.QueryAsync<QuestionDto>(new CommandDefinition(query, new { CourseId = courseId }, cancellationToken: ct));
        return questions.ToList();
    }

    public async Task<QuestionDetailDto?> GetQuestionDetailAsync(int questionId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var qQuery = @"
            SELECT v.id as Id, v.predmet_id as CourseId, v.gradivo_id as MaterialId, g.naslov as MaterialTitle,
                   v.uporabnik_id as AuthorId, COALESCE(u.ime, 'Neznan avtor') as AuthorName,
                   v.naslov as Title, v.vsebina as Content, v.ustvarjeno_dne as CreatedAt
            FROM vprasanje v
            LEFT JOIN gradivo g ON v.gradivo_id = g.id
            LEFT JOIN uporabnik u ON v.uporabnik_id = u.id
            WHERE v.id = @QuestionId";

        var q = await connection.QuerySingleOrDefaultAsync<dynamic>(new CommandDefinition(qQuery, new { QuestionId = questionId }, cancellationToken: ct));
        if (q is null) return null;

        var aQuery = @"
            SELECT o.id as Id, o.vprasanje_id as QuestionId, o.nadrejeni_odgovor_id as ParentAnswerId,
                   o.uporabnik_id as AuthorId, COALESCE(u.ime, 'Neznan avtor') as AuthorName,
                   o.vsebina as Content, o.ustvarjeno_dne as CreatedAt
            FROM odgovor o
            LEFT JOIN uporabnik u ON o.uporabnik_id = u.id
            WHERE o.vprasanje_id = @QuestionId
            ORDER BY o.ustvarjeno_dne ASC";

        var answers = await connection.QueryAsync<AnswerDto>(new CommandDefinition(aQuery, new { QuestionId = questionId }, cancellationToken: ct));

        return new QuestionDetailDto(
            (int)q.id, (int)q.courseid, q.materialid != null ? (int)q.materialid : null, q.materialtitle as string,
            (int)q.authorid, (string)q.authorname, (string)q.title, (string)q.content, (DateTime)q.createdat,
            answers.ToList()
        );
    }

    public async Task<QuestionDto> CreateQuestionAsync(int courseId, int userId, CreateQuestionRequest req, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = @"
            INSERT INTO vprasanje (predmet_id, gradivo_id, uporabnik_id, naslov, vsebina)
            VALUES (@CourseId, @MaterialId, @UserId, @Title, @Content)
            RETURNING id, ustvarjeno_dne";

        var result = await connection.QuerySingleAsync<dynamic>(new CommandDefinition(query, 
            new { CourseId = courseId, MaterialId = req.MaterialId, UserId = userId, Title = req.Title, Content = req.Content }, cancellationToken: ct));

        var metaQuery = @"
            SELECT u.ime as AuthorName, g.naslov as MaterialTitle 
            FROM uporabnik u 
            LEFT JOIN gradivo g ON g.id = @MaterialId 
            WHERE u.id = @UserId";

        var meta = await connection.QuerySingleAsync<dynamic>(new CommandDefinition(metaQuery, new { UserId = userId, MaterialId = req.MaterialId }, cancellationToken: ct));

        return new QuestionDto((int)result.id, courseId, req.MaterialId, meta.materialtitle as string, userId, (string)meta.authorname, req.Title, req.Content, 0, (DateTime)result.ustvarjeno_dne);
    }

    public async Task<AnswerDto> AddAnswerAsync(int questionId, int userId, string content, int? parentAnswerId = null, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = @"
            INSERT INTO odgovor (vprasanje_id, nadrejeni_odgovor_id, uporabnik_id, vsebina)
            VALUES (@QuestionId, @ParentAnswerId, @UserId, @Content)
            RETURNING id, ustvarjeno_dne";

        var result = await connection.QuerySingleAsync<dynamic>(new CommandDefinition(query, 
            new { QuestionId = questionId, ParentAnswerId = parentAnswerId, UserId = userId, Content = content }, cancellationToken: ct));

        var userQuery = "SELECT ime FROM uporabnik WHERE id = @UserId";
        var authorName = await connection.QuerySingleAsync<string>(new CommandDefinition(userQuery, new { UserId = userId }, cancellationToken: ct));

        return new AnswerDto((int)result.id, questionId, parentAnswerId, userId, authorName, content, (DateTime)result.ustvarjeno_dne);
    }

    public async Task<(int CourseId, int AuthorId)?> GetQuestionMetaAsync(int questionId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = "SELECT predmet_id as CourseId, uporabnik_id as AuthorId FROM vprasanje WHERE id = @QuestionId";
        var res = await connection.QuerySingleOrDefaultAsync<dynamic>(new CommandDefinition(query, new { QuestionId = questionId }, cancellationToken: ct));
        return res != null ? ((int)res.courseid, (int)res.authorid) : null;
    }

    public async Task<(int QuestionId, int CourseId, int AuthorId)?> GetAnswerMetaAsync(int answerId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = @"
            SELECT o.vprasanje_id as QuestionId, v.predmet_id as CourseId, o.uporabnik_id as AuthorId 
            FROM odgovor o 
            JOIN vprasanje v ON o.vprasanje_id = v.id 
            WHERE o.id = @AnswerId";
        var res = await connection.QuerySingleOrDefaultAsync<dynamic>(new CommandDefinition(query, new { AnswerId = answerId }, cancellationToken: ct));
        return res != null ? ((int)res.questionid, (int)res.courseid, (int)res.authorid) : null;
    }

    public async Task DeleteQuestionAsync(int questionId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        await connection.ExecuteAsync(new CommandDefinition("DELETE FROM vprasanje WHERE id = @QuestionId", new { QuestionId = questionId }, cancellationToken: ct));
    }

    public async Task DeleteAnswerAsync(int answerId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        await connection.ExecuteAsync(new CommandDefinition("DELETE FROM odgovor WHERE id = @AnswerId", new { AnswerId = answerId }, cancellationToken: ct));
    }
}
