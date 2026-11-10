namespace StudentHubAPI.Models.Dtos;

public sealed record ModeratorStatusDto(bool IsModerator);

public sealed record ModerationCourseDto(
    int Id,
    string Name,
    string? ProgramName,
    int PendingMaterialsCount,
    int TotalMaterialsCount
);

public sealed record ModeratorUserDto(
    int UserId,
    string Name,
    string Email,
    DateTime AssignedAt
);

public sealed record AssignModeratorRequest(int UserId);
