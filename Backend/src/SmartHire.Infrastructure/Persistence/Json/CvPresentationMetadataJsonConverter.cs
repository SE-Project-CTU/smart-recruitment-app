using System.Text.Json;
using System.Text.Json.Serialization;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Infrastructure.Persistence.Json;

public sealed class CvPresentationMetadataJsonConverter
    : JsonConverter<CvPresentationMetadata> {
    public override CvPresentationMetadata Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options) {
        using var document = JsonDocument.ParseValue(ref reader);
        var root = document.RootElement;
        
        return new CvPresentationMetadata {
            Version = ReadString(root, "version") ?? "1.0",
            TemplateCode = ReadString(root, "templateCode", "template_code") ?? string.Empty,
            UpdatedAt = ReadDateTimeOffset(root, "updatedAt", "updated_at")
        };
    }
    
    public override void Write(
        Utf8JsonWriter writer,
        CvPresentationMetadata value,
        JsonSerializerOptions options) {
        writer.WriteStartObject();
        writer.WriteString("version", value.Version);
        writer.WriteString("templateCode", value.TemplateCode);
        writer.WriteString("updatedAt", value.UpdatedAt);
        writer.WriteEndObject();
    }
    
    private static string? ReadString(JsonElement root, params string[] propertyNames) {
        foreach (var propertyName in propertyNames) {
            if (root.TryGetProperty(propertyName, out var property)) {
                return property.GetString();
            }
        }

        return null;
    }
    
    private static DateTimeOffset ReadDateTimeOffset(
        JsonElement root,
        string camelCaseName,
        string snakeCaseName) {
        if (root.TryGetProperty(camelCaseName, out var property) ||
            root.TryGetProperty(snakeCaseName, out property)) {
            return property.GetDateTimeOffset();
        }

        return default;
    }
}
