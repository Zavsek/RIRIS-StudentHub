namespace StudentHubAPI.Models;

public sealed class Gradivo
{
    public int Id { get; init; }
    public int PredmetId { get; init; }
    public int UporabnikId { get; init; }
    public string Naslov { get; init; } = "";
    public string? Opis { get; init; }
    public string ImeDatoteke { get; init; } = "";
    public string SupabasePath { get; init; } = "";
    public string Status { get; init; } = "";
    public DateTime UstvarjenoDne { get; init; }
}
