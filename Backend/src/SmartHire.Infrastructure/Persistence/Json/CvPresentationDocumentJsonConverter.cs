using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Infrastructure.Persistence.Json;

/// <summary>
/// Supports both camelCase and legacy snake_case properties throughout a
/// presentation document. New JSON is written using camelCase.
/// </summary>
public sealed class CvPresentationDocumentJsonConverter
    : JsonConverter<CvPresentationDocument> {
    public override CvPresentationDocument Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options) {
        using var document = JsonDocument.ParseValue(ref reader);
        var root = document.RootElement;

        if (root.ValueKind != JsonValueKind.Object) {
            throw new JsonException("A CV presentation document must be a JSON object.");
        }

        var normalized = NormalizePropertyNames(JsonNode.Parse(root.GetRawText()))
            ?? throw new JsonException("A CV presentation document cannot be null.");

        using var normalizedDocument = JsonDocument.Parse(normalized.ToJsonString());
        var normalizedRoot = normalizedDocument.RootElement;

        return new CvPresentationDocument {
            Metadata = ReadPart<CvPresentationMetadata>(normalizedRoot, "metadata", options),
            Styles = ReadPart<CvPresentationStyles>(normalizedRoot, "styles", options)
        };
    }

    public override void Write(
        Utf8JsonWriter writer,
        CvPresentationDocument value,
        JsonSerializerOptions options) {
        writer.WriteStartObject();
        writer.WritePropertyName("metadata");
        JsonSerializer.Serialize(writer, value.Metadata, options);
        writer.WritePropertyName("styles");
        JsonSerializer.Serialize(writer, value.Styles, options);
        writer.WriteEndObject();
    }

    private static TPart ReadPart<TPart>(
        JsonElement root,
        string propertyName,
        JsonSerializerOptions options)
        where TPart : class, new() {
        if (!root.TryGetProperty(propertyName, out var element) ||
            element.ValueKind == JsonValueKind.Null) {
            return new TPart();
        }

        return JsonSerializer.Deserialize<TPart>(element.GetRawText(), options)
               ?? new TPart();
    }

    private static JsonNode? NormalizePropertyNames(JsonNode? node) {
        if (node is JsonObject jsonObject) {
            var normalizedObject = new JsonObject();
            foreach (var property in jsonObject) {
                normalizedObject[property.Key] =
                    NormalizePropertyNames(property.Value?.DeepClone());
            }

            return normalizedObject;
        }

        if (node is JsonArray jsonArray) {
            var normalizedArray = new JsonArray();
            foreach (var item in jsonArray) {
                normalizedArray.Add(NormalizePropertyNames(item?.DeepClone()));
            }

            return normalizedArray;
        }

        return node?.DeepClone();
    }

    private static string ToCamelCase(string key) {
        var result = new StringBuilder(key.Length);
        var uppercaseNext = false;

        foreach (var character in key) {
            if (character == '_') {
                uppercaseNext = result.Length > 0;
                continue;
            }

            result.Append(uppercaseNext ? char.ToUpperInvariant(character) : character);
            uppercaseNext = false;
        }

        return result.ToString();
    }
}
