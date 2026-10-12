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
            TemplateCode =
                ReadString(root, "template_code")
                ?? string.Empty,
            UpdatedAt = ReadDateTimeOffset(root, "updated_at")
        };
    }
    
    public override void Write(
        Utf8JsonWriter writer,
        CvPresentationMetadata value,
        JsonSerializerOptions options) {
        writer.WriteStartObject();
        writer.WriteString("version", value.Version);
        writer.WriteString("template_code", value.TemplateCode);
        writer.WriteString("updated_at", value.UpdatedAt);
        writer.WriteEndObject();
    }
    
    private static string? ReadString(JsonElement root, string propertyName) =>
        root.TryGetProperty(propertyName, out var property)
            ? property.GetString()
            : null;
    
    private static DateTimeOffset ReadDateTimeOffset(
        JsonElement root,
        string propertyName) =>
        root.TryGetProperty(propertyName, out var property)
            ? property.GetDateTimeOffset()
            : default;
}