using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Infrastructure.Persistence.Json;

/// <summary>
/// Reads legacy snake_case content JSON and writes the canonical camelCase shape.
/// Dynamic values inside arrays and strings are preserved as-is.
/// </summary>
public sealed class CvContentDocumentJsonConverter : JsonConverter<CvContentDocument> {
    public override CvContentDocument Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options) {
        using var document = JsonDocument.ParseValue(ref reader);
        var root = document.RootElement;
        
        if (root.ValueKind != JsonValueKind.Object) {
            throw new JsonException("A CV content document must be a JSON object.");
        }
        
        return new CvContentDocument {
            Metadata = ReadPart<CvDocumentMetadata>(root, "metadata", options),
            Profile = ReadPart<CvProfile>(root, "profile", options),
            Sections = ReadPart<CvSections>(root, "sections", options)
        };
    }
    
    public override void Write(
        Utf8JsonWriter writer,
        CvContentDocument value,
        JsonSerializerOptions options) {
        writer.WriteStartObject();
        writer.WritePropertyName("metadata");
        JsonSerializer.Serialize(writer, value.Metadata, options);
        writer.WritePropertyName("profile");
        JsonSerializer.Serialize(writer, value.Profile, options);
        writer.WritePropertyName("sections");
        JsonSerializer.Serialize(writer, value.Sections, options);
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
        
        var node = JsonNode.Parse(element.GetRawText());
        var normalizedJson = NormalizePropertyNames(node)?.ToJsonString();
        
        return JsonSerializer.Deserialize<TPart>(normalizedJson!, options)
               ?? new TPart();
    }
    
    private static JsonNode? NormalizePropertyNames(JsonNode? node) {
        if (node is JsonObject jsonObject) {
            var normalizedObject = new JsonObject();
            foreach (var property in jsonObject) {
                normalizedObject[ToCamelCase(property.Key)] =
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
        var result = new System.Text.StringBuilder(key.Length);
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