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
    DateTime CreatedAt,
    int? ReviewedById = null,
    string? ReviewedByName = null
)
{
    public MaterialDto() : this(0, 0, 0, "", "", null, "", "", default, null, null) { }
}

public sealed record UpdateMaterialStatusRequest(string Status);
