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
    string? ReviewedByName = null,
    double? AverageRating = null,
    int RatingCount = 0,
    int? UserRating = null
)
{
    public MaterialDto() : this(0, 0, 0, "", "", null, "", "", default, null, null, null, 0, null) { }
}

public sealed record UpdateMaterialStatusRequest(string Status);

public sealed record RateMaterialRequest(int Rating);

public sealed record MaterialRatingSummaryDto(
    int MaterialId,
    double? AverageRating,
    int RatingCount,
    int? UserRating
)
{
    public MaterialRatingSummaryDto() : this(0, null, 0, null) { }
}
