using System.Text.Json;
using System.Text.Json.Serialization;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Infrastructure.Persistence.Json;

/// <summary>
/// Reads both camelCase and snake_case style keys, and writes camelCase.
/// </summary>
public sealed class CvFieldStyleJsonConverter : JsonConverter<CvFieldStyle> {
    public override CvFieldStyle Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options) {
        using var document = JsonDocument.ParseValue(ref reader);
        var root = document.RootElement;

        if (root.ValueKind != JsonValueKind.Object) {
            throw new JsonException("A CV field style must be a JSON object.");
        }

        var color = string.Empty;
        var fontSize = 0f;
        var fontFamily = string.Empty;
        var fontWeight = string.Empty;
        var fontStyle = string.Empty;
        var textDecoration = string.Empty;
        string? textAlign = null;
        string? listStyle = null;

        foreach (var property in root.EnumerateObject()) {
            var key = NormalizeKey(property.Name);

            switch (key) {
                case "color":
                    color = ReadRequiredString(property.Value, property.Name);
                    break;
                case "fontsize":
                    fontSize = ReadSingle(property.Value, property.Name);
                    break;
                case "fontfamily":
                    fontFamily = ReadRequiredString(property.Value, property.Name);
                    break;
                case "fontweight":
                    fontWeight = ReadRequiredString(property.Value, property.Name);
                    break;
                case "fontstyle":
                    fontStyle = ReadRequiredString(property.Value, property.Name);
                    break;
                case "textdecoration":
                    textDecoration = ReadRequiredString(property.Value, property.Name);
                    break;
                case "textalign":
                    textAlign = ReadOptionalString(property.Value, property.Name);
                    break;
                case "liststyle":
                    listStyle = ReadOptionalString(property.Value, property.Name);
                    break;
            }
        }

        return new CvFieldStyle {
            Color = color,
            FontSize = fontSize,
            FontFamily = fontFamily,
            FontWeight = fontWeight,
            FontStyle = fontStyle,
            TextDecoration = textDecoration,
            TextAlign = textAlign,
            ListStyle = listStyle
        };
    }

    public override void Write(
        Utf8JsonWriter writer,
        CvFieldStyle value,
        JsonSerializerOptions options) {
        writer.WriteStartObject();
        writer.WriteString("color", value.Color);
        writer.WriteNumber("fontSize", value.FontSize);
        writer.WriteString("fontFamily", value.FontFamily);
        writer.WriteString("fontWeight", value.FontWeight);
        writer.WriteString("fontStyle", value.FontStyle);
        writer.WriteString("textDecoration", value.TextDecoration);

        if (value.TextAlign is null) {
            writer.WriteNull("textAlign");
        } else {
            writer.WriteString("textAlign", value.TextAlign);
        }

        if (value.ListStyle is null) {
            writer.WriteNull("listStyle");
        } else {
            writer.WriteString("listStyle", value.ListStyle);
        }

        writer.WriteEndObject();
    }

    private static string NormalizeKey(string key) =>
        key.Replace("_", string.Empty, StringComparison.Ordinal).ToLowerInvariant();

    private static string ReadRequiredString(JsonElement value, string propertyName) =>
        ReadOptionalString(value, propertyName)
        ?? throw new JsonException($"CV style property '{propertyName}' cannot be null.");

    private static string? ReadOptionalString(JsonElement value, string propertyName) {
        if (value.ValueKind == JsonValueKind.Null) {
            return null;
        }

        if (value.ValueKind != JsonValueKind.String) {
            throw new JsonException($"CV style property '{propertyName}' must be a string or null.");
        }

        return value.GetString();
    }

    private static float ReadSingle(JsonElement value, string propertyName) {
        if (value.ValueKind != JsonValueKind.Number || !value.TryGetSingle(out var result)) {
            throw new JsonException($"CV style property '{propertyName}' must be a number.");
        }

        return result;
    }
}
