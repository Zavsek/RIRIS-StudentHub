using System.Net.Http.Headers;

namespace StudentHubAPI.Services;

public sealed class SupabaseStorageService(HttpClient http, SupabaseOptions options)
{
    public async Task<string> UploadFileAsync(string fileName, byte[] fileBytes, CancellationToken cancellationToken = default)
    {
        var objectKey = $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";
        using var content = new ByteArrayContent(fileBytes);
        content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");

        using var response = await http.PostAsync(ObjectPath(objectKey), content, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw await StorageFailed(response, cancellationToken);

        return objectKey;
    }

    public async Task<byte[]?> DownloadFileAsync(string supabasePath, CancellationToken cancellationToken = default)
    {
        using var response = await http.GetAsync(ObjectPath(supabasePath), cancellationToken);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
            return null;
        if (!response.IsSuccessStatusCode)
            throw await StorageFailed(response, cancellationToken);

        return await response.Content.ReadAsByteArrayAsync(cancellationToken);
    }

    public async Task DeleteFileAsync(string supabasePath, CancellationToken cancellationToken = default)
    {
        var payload = System.Text.Json.JsonSerializer.Serialize(new { prefixes = new[] { supabasePath } });
        var body = new StringContent(payload, System.Text.Encoding.UTF8, "application/json");
        using var request = new HttpRequestMessage(HttpMethod.Delete, BucketPath()) { Content = body };
        using var response = await http.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw await StorageFailed(response, cancellationToken);
    }

    private string ObjectPath(string objectKey) =>
        $"{BucketPath()}/{Uri.EscapeDataString(objectKey)}";

    private string BucketPath() =>
        $"storage/v1/object/{Uri.EscapeDataString(options.Bucket)}";

    private static async Task<InvalidOperationException> StorageFailed(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        var detail = await response.Content.ReadAsStringAsync(cancellationToken);
        return new InvalidOperationException($"Shramba gradiv je vrnila {(int)response.StatusCode}. {detail}");
    }
}
