namespace StudentHubAPI.Models.Dtos;

public sealed record FacultyDto(
    int Id,
    string Name,
    string? University,
    string? Location,
    int? YearFounded
);

public sealed record ProgramDto(
    int Id,
    string Name,
    int FacultyId,
    int? DurationYears,
    int Level
);

public sealed record CourseDto(
    int Id,
    string Name,
    int? ProgramId,
    int? Year,
    string? Professor,
    int? Ects,
    string? Semester
);
