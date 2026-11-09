namespace StudentHubAPI.Models;

public sealed record Fakulteta(
    int Id,
    string Ime,
    string? Univerza,
    string? Sedez,
    int? LetoUstanovitve
);

public sealed record Smer(
    int Id,
    string Ime,
    int FakultetaId,
    int? TrajanjeLet,
    int Stopnja
);

public sealed record Predmet(
    int Id,
    string Ime,
    int? SmerId,
    int? Letnik,
    string? Nosilec,
    int? Ects,
    string? Semester
);
