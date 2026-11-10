namespace StudentHubAPI.Models.Dtos;

public sealed record QuestionDto(
    int Id,
    int CourseId,
    int? MaterialId,
    string? MaterialTitle,
    int AuthorId,
    string AuthorName,
    string Title,
    string Content,
    int AnswersCount,
    DateTime CreatedAt
)
{
    public QuestionDto() : this(0, 0, null, null, 0, "", "", "", 0, default) { }
}

public sealed record AnswerDto(
    int Id,
    int QuestionId,
    int? ParentAnswerId,
    int AuthorId,
    string AuthorName,
    string Content,
    DateTime CreatedAt
)
{
    public AnswerDto() : this(0, 0, null, 0, "", "", default) { }
}

public sealed record QuestionDetailDto(
    int Id,
    int CourseId,
    int? MaterialId,
    string? MaterialTitle,
    int AuthorId,
    string AuthorName,
    string Title,
    string Content,
    DateTime CreatedAt,
    List<AnswerDto> Answers
);

public sealed record CreateQuestionRequest(string Title, string Content, int? MaterialId = null);

public sealed record CreateAnswerRequest(string Content, int? ParentAnswerId = null);
