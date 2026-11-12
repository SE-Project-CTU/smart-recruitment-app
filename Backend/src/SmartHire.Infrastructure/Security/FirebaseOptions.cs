using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartHire.Infrastructure.Security;

public sealed class FirebaseOptions {
    public const string SectionName = "Firebase";

    public string Type { get; init; } = "service_account";
    public string ProjectId { get; init; } = string.Empty;
    public string PrivateKeyId { get; init; } = string.Empty;
    public string PrivateKey { get; init; } = string.Empty;
    public string ClientEmail { get; init; } = string.Empty;
    public string ClientId { get; init; } = string.Empty;
    public string AuthUri { get; init; } = "https://accounts.google.com/o/oauth2/auth";
    public string TokenUri { get; init; } = "https://oauth2.googleapis.com/token";
    public string AuthProviderX509CertUrl { get; init; } = "https://www.googleapis.com/oauth2/v1/certs";
    public string ClientX509CertUrl { get; init; } = string.Empty;
    public string UniverseDomain { get; init; } = "googleapis.com";

    public bool IsConfigured() =>
        !string.IsNullOrWhiteSpace(ProjectId) &&
        !string.IsNullOrWhiteSpace(PrivateKey) &&
        !string.IsNullOrWhiteSpace(ClientEmail);

    public string ToServiceAccountJson() {
        var normalizedPrivateKey = PrivateKey.Replace("\\n", "\n", StringComparison.Ordinal);

        var payload = new FirebaseServiceAccountPayload(
            Type: string.IsNullOrWhiteSpace(Type) ? "service_account" : Type,
            ProjectId: ProjectId.Trim(),
            PrivateKeyId: PrivateKeyId.Trim(),
            PrivateKey: normalizedPrivateKey,
            ClientEmail: ClientEmail.Trim(),
            ClientId: ClientId.Trim(),
            AuthUri: AuthUri.Trim(),
            TokenUri: TokenUri.Trim(),
            AuthProviderX509CertUrl: AuthProviderX509CertUrl.Trim(),
            ClientX509CertUrl: ClientX509CertUrl.Trim(),
            UniverseDomain: string.IsNullOrWhiteSpace(UniverseDomain) ? "googleapis.com" : UniverseDomain.Trim()
        );

        return JsonSerializer.Serialize(payload);
    }

    private sealed record FirebaseServiceAccountPayload(
        [property: JsonPropertyName("type")] string Type,
        [property: JsonPropertyName("project_id")] string ProjectId,
        [property: JsonPropertyName("private_key_id")] string PrivateKeyId,
        [property: JsonPropertyName("private_key")] string PrivateKey,
        [property: JsonPropertyName("client_email")] string ClientEmail,
        [property: JsonPropertyName("client_id")] string ClientId,
        [property: JsonPropertyName("auth_uri")] string AuthUri,
        [property: JsonPropertyName("token_uri")] string TokenUri,
        [property: JsonPropertyName("auth_provider_x509_cert_url")] string AuthProviderX509CertUrl,
        [property: JsonPropertyName("client_x509_cert_url")] string ClientX509CertUrl,
        [property: JsonPropertyName("universe_domain")] string UniverseDomain
    );
}

