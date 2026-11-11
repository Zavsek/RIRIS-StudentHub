using Dapper;
using StudentHubAPI.Data;
using StudentHubAPI.Models.Dtos;

namespace StudentHubAPI.Handlers;

public sealed class ScheduleHandler(IDbConnectionFactory connections)
{
    public async Task<List<ScheduleEntryDto>> GetUserScheduleAsync(int userId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = @"
            SELECT id as Id, uporabnik_id as UserId, predmet_termin_id as CourseTermId,
                   naziv as Title, COALESCE(tip, 'Predavanja') as Type, dan_v_tednu as DayOfWeek,
                   ura_od as StartTime, ura_do as EndTime, lokacija as Location, ustvarjeno_dne as CreatedAt
            FROM urnik_termin
            WHERE uporabnik_id = @UserId
            ORDER BY dan_v_tednu ASC, ura_od ASC";

        var entries = await connection.QueryAsync<ScheduleEntryDb>(
            new CommandDefinition(query, new { UserId = userId }, cancellationToken: ct));

        return entries.Select(e => new ScheduleEntryDto(
            e.Id, e.UserId, e.CourseTermId, e.Title, e.Type, e.DayOfWeek,
            e.StartTime.ToString("HH:mm"), e.EndTime.ToString("HH:mm"), e.Location
        )).ToList();
    }

    public async Task<ScheduleEntryDto> CreateScheduleEntryAsync(int userId, CreateScheduleEntryRequest req, CancellationToken ct = default)
    {
        var start = TimeOnly.Parse(req.StartTime);
        var end = TimeOnly.Parse(req.EndTime);
        var type = string.IsNullOrWhiteSpace(req.Type) ? "Predavanja" : req.Type;

        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var insertQuery = @"
            INSERT INTO urnik_termin (uporabnik_id, naziv, tip, dan_v_tednu, ura_od, ura_do, lokacija)
            VALUES (@UserId, @Title, @Type, @DayOfWeek, @StartTime, @EndTime, @Location)
            RETURNING id";

        var id = await connection.ExecuteScalarAsync<int>(new CommandDefinition(insertQuery, new
        {
            UserId = userId,
            Title = req.Title,
            Type = type,
            DayOfWeek = req.DayOfWeek,
            StartTime = start,
            EndTime = end,
            Location = req.Location
        }, cancellationToken: ct));

        return new ScheduleEntryDto(id, userId, null, req.Title, type, req.DayOfWeek, req.StartTime, req.EndTime, req.Location);
    }

    public async Task<bool> DeleteScheduleEntryAsync(int entryId, int userId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var affected = await connection.ExecuteAsync(new CommandDefinition(
            "DELETE FROM urnik_termin WHERE id = @Id AND uporabnik_id = @UserId",
            new { Id = entryId, UserId = userId }, cancellationToken: ct));
        return affected > 0;
    }

    public async Task<List<CourseTermDto>> GetCourseTermsAsync(int courseId, int userId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = @"
            SELECT pt.id as Id, pt.predmet_id as CourseId, p.ime as CourseName,
                   pt.naziv as Title, pt.tip as Type, pt.skupina as Group,
                   pt.dan_v_tednu as DayOfWeek, pt.ura_od as StartTime, pt.ura_do as EndTime,
                   pt.lokacija as Location, pt.ustvaril_uporabnik_id as CreatorId, pt.ustvarjeno_dne as CreatedAt,
                   EXISTS(
                       SELECT 1 FROM urnik_termin ut 
                       WHERE ut.uporabnik_id = @UserId AND ut.predmet_termin_id = pt.id
                   ) as IsInUserSchedule
            FROM predmet_termin pt
            JOIN predmet p ON pt.predmet_id = p.id
            JOIN predmet selected_p ON LOWER(p.ime) = LOWER(selected_p.ime)
            WHERE selected_p.id = @CourseId
            ORDER BY pt.dan_v_tednu ASC, pt.ura_od ASC";

        var terms = await connection.QueryAsync<CourseTermDb>(
            new CommandDefinition(query, new { CourseId = courseId, UserId = userId }, cancellationToken: ct));

        return terms.Select(t => new CourseTermDto(
            t.Id, t.CourseId, t.CourseName, t.Title, t.Type, t.Group, t.DayOfWeek,
            t.StartTime.ToString("HH:mm"), t.EndTime.ToString("HH:mm"), t.Location, t.IsInUserSchedule
        )).ToList();
    }

    public async Task<CourseTermDto> CreateCourseTermAsync(int courseId, int creatorId, CreateCourseTermRequest req, CancellationToken ct = default)
    {
        var start = TimeOnly.Parse(req.StartTime);
        var end = TimeOnly.Parse(req.EndTime);

        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var insertQuery = @"
            INSERT INTO predmet_termin (predmet_id, naziv, tip, skupina, dan_v_tednu, ura_od, ura_do, lokacija, ustvaril_uporabnik_id)
            VALUES (@CourseId, @Title, @Type, @Group, @DayOfWeek, @StartTime, @EndTime, @Location, @CreatorId)
            RETURNING id";

        var id = await connection.ExecuteScalarAsync<int>(new CommandDefinition(insertQuery, new
        {
            CourseId = courseId,
            Title = req.Title,
            Type = req.Type,
            Group = req.Group,
            DayOfWeek = req.DayOfWeek,
            StartTime = start,
            EndTime = end,
            Location = req.Location,
            CreatorId = creatorId
        }, cancellationToken: ct));

        var courseName = await connection.ExecuteScalarAsync<string>(
            new CommandDefinition("SELECT ime FROM predmet WHERE id = @CourseId", new { CourseId = courseId }, cancellationToken: ct));

        return new CourseTermDto(id, courseId, courseName, req.Title, req.Type, req.Group, req.DayOfWeek, req.StartTime, req.EndTime, req.Location, false);
    }

    public async Task<int?> GetCourseTermCourseIdAsync(int termId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        return await connection.ExecuteScalarAsync<int?>(new CommandDefinition(
            "SELECT predmet_id FROM predmet_termin WHERE id = @TermId", new { TermId = termId }, cancellationToken: ct));
    }

    public async Task<bool> DeleteCourseTermAsync(int termId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var affected = await connection.ExecuteAsync(new CommandDefinition(
            "DELETE FROM predmet_termin WHERE id = @TermId", new { TermId = termId }, cancellationToken: ct));
        return affected > 0;
    }

    public async Task<ScheduleEntryDto?> ImportCourseTermAsync(int userId, int courseTermId, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var termQuery = @"
            SELECT pt.id as Id, pt.predmet_id as CourseId, p.ime as CourseName, pt.naziv as Title, pt.tip as Type, pt.skupina as Group,
                   pt.dan_v_tednu as DayOfWeek, pt.ura_od as StartTime, pt.ura_do as EndTime, pt.lokacija as Location
            FROM predmet_termin pt
            JOIN predmet p ON pt.predmet_id = p.id
            WHERE pt.id = @CourseTermId";

        var term = await connection.QuerySingleOrDefaultAsync<CourseTermImportDb>(
            new CommandDefinition(termQuery, new { CourseTermId = courseTermId }, cancellationToken: ct));
        if (term == null) return null;

        var existingId = await connection.ExecuteScalarAsync<int?>(new CommandDefinition(
            "SELECT id FROM urnik_termin WHERE uporabnik_id = @UserId AND predmet_termin_id = @CourseTermId",
            new { UserId = userId, CourseTermId = courseTermId }, cancellationToken: ct));

        if (existingId.HasValue)
        {
            return new ScheduleEntryDto(existingId.Value, userId, courseTermId, term.Title, term.Type,
                term.DayOfWeek, term.StartTime.ToString("HH:mm"), term.EndTime.ToString("HH:mm"), term.Location);
        }

        string title = string.IsNullOrWhiteSpace(term.Group)
            ? $"{term.CourseName} - {term.Title}"
            : $"{term.CourseName} - {term.Title} ({term.Group})";

        var insertQuery = @"
            INSERT INTO urnik_termin (uporabnik_id, predmet_termin_id, naziv, tip, dan_v_tednu, ura_od, ura_do, lokacija)
            VALUES (@UserId, @CourseTermId, @Title, @Type, @DayOfWeek, @StartTime, @EndTime, @Location)
            RETURNING id";

        var newId = await connection.ExecuteScalarAsync<int>(new CommandDefinition(insertQuery, new
        {
            UserId = userId,
            CourseTermId = courseTermId,
            Title = title,
            Type = term.Type,
            DayOfWeek = term.DayOfWeek,
            StartTime = term.StartTime,
            EndTime = term.EndTime,
            Location = term.Location
        }, cancellationToken: ct));

        return new ScheduleEntryDto(newId, userId, courseTermId, title, term.Type,
            term.DayOfWeek, term.StartTime.ToString("HH:mm"), term.EndTime.ToString("HH:mm"), term.Location);
    }

    public async Task<List<CourseStudentDto>> GetEnrolledStudentsAsync(int courseId, int currentUserId, CancellationToken ct = default)
    {
        return await GetColleaguesAsync(currentUserId, courseId, ct);
    }

    public async Task<List<CourseStudentDto>> GetColleaguesAsync(int currentUserId, int? courseId = null, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        string query;
        object parameters;

        if (courseId.HasValue && courseId.Value > 0)
        {
            query = @"
                SELECT DISTINCT u.id as Id, u.ime as Name, u.email as Email
                FROM uporabnik u
                JOIN uporabnik_predmet up ON up.uporabnik_id = u.id
                JOIN predmet p ON up.predmet_id = p.id
                JOIN predmet target ON LOWER(p.ime) = LOWER(target.ime)
                WHERE target.id = @CourseId AND u.id != @UserId
                ORDER BY u.ime ASC";
            parameters = new { CourseId = courseId.Value, UserId = currentUserId };
        }
        else
        {
            query = @"
                SELECT DISTINCT u.id as Id, u.ime as Name, u.email as Email
                FROM uporabnik u
                JOIN uporabnik_predmet up ON up.uporabnik_id = u.id
                WHERE up.predmet_id IN (
                    SELECT up_me.predmet_id 
                    FROM uporabnik_predmet up_me 
                    WHERE up_me.uporabnik_id = @UserId
                )
                AND u.id != @UserId
                ORDER BY u.ime ASC";
            parameters = new { UserId = currentUserId };
        }

        var list = await connection.QueryAsync<CourseStudentDto>(
            new CommandDefinition(query, parameters, cancellationToken: ct));
        return list.ToList();
    }

    public async Task<bool> ValidateUsersEnrolledInCourseAsync(int courseId, List<int> userIds, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var query = @"
            SELECT COUNT(DISTINCT up.uporabnik_id)
            FROM uporabnik_predmet up
            JOIN predmet p ON up.predmet_id = p.id
            JOIN predmet target ON LOWER(p.ime) = LOWER(target.ime)
            WHERE target.id = @CourseId AND up.uporabnik_id = ANY(@UserIds)";

        var count = await connection.ExecuteScalarAsync<int>(
            new CommandDefinition(query, new { CourseId = courseId, UserIds = userIds.Distinct().ToArray() }, cancellationToken: ct));

        return count == userIds.Distinct().Count();
    }

    public async Task<CompareWeeklyScheduleResultDto> CompareWeeklyScheduleAsync(List<int> userIds, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var ids = userIds.Distinct().ToArray();

        var entriesQuery = @"
            SELECT ut.id as Id, ut.uporabnik_id as UserId, ut.predmet_termin_id as CourseTermId,
                   ut.naziv as Title, COALESCE(ut.tip, 'Predavanja') as Type, ut.dan_v_tednu as DayOfWeek,
                   ut.ura_od as StartTime, ut.ura_do as EndTime, ut.lokacija as Location, ut.ustvarjeno_dne as CreatedAt
            FROM urnik_termin ut
            WHERE ut.uporabnik_id = ANY(@UserIds)
            ORDER BY ut.dan_v_tednu ASC, ut.ura_od ASC";

        var allEntries = (await connection.QueryAsync<ScheduleEntryDb>(
            new CommandDefinition(entriesQuery, new { UserIds = ids }, cancellationToken: ct))).ToList();

        var usersQuery = @"SELECT id as Id, ime as Name FROM uporabnik WHERE id = ANY(@UserIds) ORDER BY ime ASC";
        var users = (await connection.QueryAsync<dynamic>(
            new CommandDefinition(usersQuery, new { UserIds = ids }, cancellationToken: ct))).ToList();

        var weeklyFree = new List<DayFreeTimeDto>();
        for (int day = 1; day <= 7; day++)
        {
            var dayBusy = allEntries
                .Where(e => e.DayOfWeek == day)
                .Select(e => (e.StartTime, e.EndTime));
            weeklyFree.Add(new DayFreeTimeDto(day, CalculateFreeIntervals(dayBusy)));
        }

        var userSchedules = users.Select(u => new UserScheduleComparisonDto(
            (int)u.id, (string)u.name,
            allEntries.Where(e => e.UserId == (int)u.id).Select(e => new ScheduleEntryDto(
                e.Id, e.UserId, e.CourseTermId, e.Title, e.Type, e.DayOfWeek,
                e.StartTime.ToString("HH:mm"), e.EndTime.ToString("HH:mm"), e.Location
            )).ToList()
        )).ToList();

        return new CompareWeeklyScheduleResultDto(weeklyFree, userSchedules);
    }

    public async Task<CompareScheduleResultDto> CompareFreeTimeAsync(int courseId, CompareFreeTimeRequest req, CancellationToken ct = default)
    {
        using var connection = await connections.CreateOpenConnectionAsync(ct);
        var userIds = req.UserIds.Distinct().ToArray();

        var query = @"
            SELECT ura_od as StartTime, ura_do as EndTime
            FROM urnik_termin
            WHERE dan_v_tednu = @DayOfWeek AND uporabnik_id = ANY(@UserIds)";

        var rawBusy = await connection.QueryAsync<(TimeOnly StartTime, TimeOnly EndTime)>(
            new CommandDefinition(query, new { DayOfWeek = req.DayOfWeek, UserIds = userIds }, cancellationToken: ct));

        var freeIntervals = CalculateFreeIntervals(rawBusy);

        var entriesQuery = @"
            SELECT ut.id as Id, ut.uporabnik_id as UserId, ut.predmet_termin_id as CourseTermId,
                   ut.naziv as Title, COALESCE(ut.tip, 'Predavanja') as Type, ut.dan_v_tednu as DayOfWeek,
                   ut.ura_od as StartTime, ut.ura_do as EndTime, ut.lokacija as Location, ut.ustvarjeno_dne as CreatedAt
            FROM urnik_termin ut
            WHERE ut.dan_v_tednu = @DayOfWeek AND ut.uporabnik_id = ANY(@UserIds)
            ORDER BY ut.ura_od ASC";

        var allEntries = await connection.QueryAsync<ScheduleEntryDb>(
            new CommandDefinition(entriesQuery, new { DayOfWeek = req.DayOfWeek, UserIds = userIds }, cancellationToken: ct));

        var usersQuery = @"SELECT id as Id, ime as Name FROM uporabnik WHERE id = ANY(@UserIds)";
        var users = await connection.QueryAsync<dynamic>(
            new CommandDefinition(usersQuery, new { UserIds = userIds }, cancellationToken: ct));

        var userSchedules = new List<UserScheduleComparisonDto>();
        foreach (var u in users)
        {
            int uId = (int)u.id;
            string uName = (string)u.name;
            var userEntries = allEntries
                .Where(e => e.UserId == uId)
                .Select(e => new ScheduleEntryDto(
                    e.Id, uId, e.CourseTermId, e.Title, e.Type, e.DayOfWeek,
                    e.StartTime.ToString("HH:mm"), e.EndTime.ToString("HH:mm"), e.Location
                )).ToList();

            userSchedules.Add(new UserScheduleComparisonDto(uId, uName, userEntries));
        }

        return new CompareScheduleResultDto(freeIntervals, userSchedules);
    }

    private static List<FreeTimeIntervalDto> CalculateFreeIntervals(IEnumerable<(TimeOnly StartTime, TimeOnly EndTime)> rawBusy)
    {
        const int dayStart = 8 * 60;   // 08:00
        const int dayEnd = 20 * 60;    // 20:00

        var busyRanges = rawBusy
            .Select(b => (b.StartTime.Hour * 60 + b.StartTime.Minute, b.EndTime.Hour * 60 + b.EndTime.Minute))
            .Where(r => r.Item2 > r.Item1)
            .Select(r => (Start: Math.Max(r.Item1, dayStart), End: Math.Min(r.Item2, dayEnd)))
            .Where(r => r.End > r.Start)
            .OrderBy(r => r.Start)
            .ToList();

        var mergedBusy = MergeIntervals(busyRanges);
        return InvertBusyIntervals(mergedBusy, dayStart, dayEnd);
    }

    private static List<(int Start, int End)> MergeIntervals(List<(int Start, int End)> sortedRanges)
    {
        var merged = new List<(int Start, int End)>();
        foreach (var range in sortedRanges)
        {
            if (merged.Count == 0 || range.Start > merged[^1].End)
            {
                merged.Add(range);
            }
            else
            {
                merged[^1] = (merged[^1].Start, Math.Max(merged[^1].End, range.End));
            }
        }
        return merged;
    }

    private static List<FreeTimeIntervalDto> InvertBusyIntervals(List<(int Start, int End)> mergedBusy, int dayStart, int dayEnd)
    {
        var freeIntervals = new List<FreeTimeIntervalDto>();
        int cursor = dayStart;

        foreach (var busy in mergedBusy)
        {
            if (busy.Start > cursor)
            {
                freeIntervals.Add(FormatInterval(cursor, busy.Start));
            }
            cursor = Math.Max(cursor, busy.End);
        }

        if (cursor < dayEnd)
        {
            freeIntervals.Add(FormatInterval(cursor, dayEnd));
        }

        return freeIntervals;
    }

    private static FreeTimeIntervalDto FormatInterval(int startMin, int endMin)
    {
        var startStr = $"{startMin / 60:D2}:{startMin % 60:D2}";
        var endStr = $"{endMin / 60:D2}:{endMin % 60:D2}";
        return new FreeTimeIntervalDto(startStr, endStr, endMin - startMin);
    }
}
