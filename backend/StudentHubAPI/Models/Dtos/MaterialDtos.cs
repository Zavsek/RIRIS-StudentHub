namespace StudentHubAPI.Models.Dtos;

public sealed record MaterialDto(
    int Id,
    int CourseId,
    int AuthorId,
    string AuthorName,
    string Title,
    string? Description,
    string FileName,
    string Status,
    DateTimeOffset CreatedAt
);
