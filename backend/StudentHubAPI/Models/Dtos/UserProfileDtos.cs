namespace StudentHubAPI.Models.Dtos;

public sealed record UserProfileDto(
    int Id,
    string Email,
    string Name,
    List<CourseDto> ActiveCourses
);

public sealed record UpdateUserCoursesRequest(
    List<int> CourseIds
);
