namespace StudentHubAPI.Services;

public sealed class SupabaseOptions
{
    public const string SectionName = "Supabase";

    public string Url { get; init; } = "";
    public string Key { get; init; } = "";
    public string Bucket { get; init; } = "Gradiva";
}
