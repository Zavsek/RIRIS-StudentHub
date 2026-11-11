namespace StudentHubAPI.Models.Dtos;

public sealed record ScheduleEntryDb(
    int Id,
    int UserId,
    int? CourseTermId,
    string Title,
    string Type,
    int DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Location,
    DateTime CreatedAt
)
{
    public ScheduleEntryDb() : this(0, 0, null, "", "Predavanja", 1, default, default, null, default) { }
}

public sealed record ScheduleEntryDto(
    int Id,
    int UserId,
    int? CourseTermId,
    string Title,
    string Type,
    int DayOfWeek,
    string StartTime,
    string EndTime,
    string? Location
);

public sealed record CourseTermDb(
    int Id,
    int CourseId,
    string? CourseName,
    string Title,
    string Type,
    string? Group,
    int DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Location,
    int CreatorId,
    DateTime CreatedAt,
    bool IsInUserSchedule
)
{
    public CourseTermDb() : this(0, 0, null, "", "", null, 1, default, default, null, 0, default, false) { }
}

public sealed record CourseTermImportDb(
    int Id,
    int CourseId,
    string CourseName,
    string Title,
    string Type,
    string? Group,
    int DayOfWeek,
    TimeOnly StartTime,
    TimeOnly EndTime,
    string? Location
)
{
    public CourseTermImportDb() : this(0, 0, "", "", "", null, 1, default, default, null) { }
}

public sealed record CourseTermDto(
    int Id,
    int CourseId,
    string? CourseName,
    string Title,
    string Type,
    string? Group,
    int DayOfWeek,
    string StartTime,
    string EndTime,
    string? Location,
    bool IsInUserSchedule
);

public sealed record CreateScheduleEntryRequest(
    string Title,
    string? Type,
    int DayOfWeek,
    string StartTime,
    string EndTime,
    string? Location
);

public sealed record CreateCourseTermRequest(
    string Title,
    string Type,
    string? Group,
    int DayOfWeek,
    string StartTime,
    string EndTime,
    string? Location
);

public sealed record CompareFreeTimeRequest(
    List<int> UserIds,
    int DayOfWeek
);

public sealed record CompareWeeklyScheduleRequest(
    List<int> UserIds
);

public sealed record FreeTimeIntervalDto(
    string StartTime,
    string EndTime,
    int DurationMinutes
);

public sealed record DayFreeTimeDto(
    int DayOfWeek,
    List<FreeTimeIntervalDto> FreeIntervals
);

public sealed record UserScheduleComparisonDto(
    int UserId,
    string UserName,
    List<ScheduleEntryDto> Entries
);

public sealed record CompareScheduleResultDto(
    List<FreeTimeIntervalDto> FreeIntervals,
    List<UserScheduleComparisonDto> UserSchedules
);

public sealed record CompareWeeklyScheduleResultDto(
    List<DayFreeTimeDto> WeeklyFreeIntervals,
    List<UserScheduleComparisonDto> UserSchedules
);

public sealed record CourseStudentDto(
    int Id,
    string Name,
    string Email
)
{
    public CourseStudentDto() : this(0, "", "") { }
}
