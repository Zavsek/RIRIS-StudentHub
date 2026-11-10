namespace StudentHubAPI.Models.Dtos;

public sealed record ObligationDto(
    int Id,
    int CourseId,
    int AuthorId,
    string AuthorName,
    string Title,
    string Type,
    DateTime Date,
    string? Description,
    DateTime CreatedAt
)
{
    public ObligationDto() : this(0, 0, 0, "", "", "", default, null, default) { }
}

public sealed record CreateObligationRequest(
    string Title,
    string Type,
    DateTime Date,
    string? Description
);

public sealed record UpdateObligationRequest(
    string Title,
    string Type,
    DateTime Date,
    string? Description
);
