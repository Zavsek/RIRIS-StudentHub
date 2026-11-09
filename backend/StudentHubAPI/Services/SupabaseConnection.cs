using Microsoft.Extensions.Options;

namespace StudentHubAPI.Services;

public sealed class SupabaseConnection(HttpClient http, IOptions<SupabaseOptions> options)
{
    private readonly SupabaseOptions _options = options.Value;

    public async Task<SupabaseConnectionStatus> CheckBucketAsync(CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.Url) || string.IsNullOrWhiteSpace(_options.Key))
            return new SupabaseConnectionStatus(false, 0, "Manjka Supabase:Url ali Supabase:Key.");

        var bucket = Uri.EscapeDataString(_options.Bucket);
        using var response = await http.GetAsync($"storage/v1/bucket/{bucket}", cancellationToken);
        if (response.IsSuccessStatusCode)
            return new SupabaseConnectionStatus(true, (int)response.StatusCode, null);

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        return new SupabaseConnectionStatus(false, (int)response.StatusCode, body);
    }
}

public sealed record SupabaseConnectionStatus(bool Succeeded, int StatusCode, string? Detail);
