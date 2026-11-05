using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartHire.Domain.ValueObjects.Cv;

/// <summary>
/// Root node of a Tiptap document tree.
/// </summary>
[JsonConverter(typeof(CvTiptapDocumentJsonConverter))]
public sealed record CvTiptapDocument : CvTiptapNode
{
    [JsonPropertyName("type")]
    public override string Type { get; init; } = CvTiptapNodeTypes.Doc;

    public static CvTiptapDocument Empty(double fontSize = 13) => new()
    {
        Type = CvTiptapNodeTypes.Doc,
        Attrs = new Dictionary<string, object?> { [CvTiptapAttributeNames.FontSize] = fontSize },
        Content = [new CvTiptapNode { Type = CvTiptapNodeTypes.Paragraph }]
    };

    public static CvTiptapDocument FromText(string text, double fontSize = 13) => new()
    {
        Type = CvTiptapNodeTypes.Doc,
        Attrs = new Dictionary<string, object?> { [CvTiptapAttributeNames.FontSize] = fontSize },
        Content = [
            new CvTiptapNode
            {
                Type = CvTiptapNodeTypes.Paragraph,
                Content = string.IsNullOrEmpty(text)
                    ? []
                    : [new CvTiptapNode { Type = CvTiptapNodeTypes.Text, Text = text }]
            }
        ]
    };

    /// <summary>
    /// Recursively extracts all plain text from a Tiptap node and its descendants.
    /// </summary>
    public static string ExtractPlainText(CvTiptapNode? node)
    {
        if (node is null)
        {
            return string.Empty;
        }

        var sb = new StringBuilder();
        ExtractPlainTextRecursive(node, sb);
        return sb.ToString().Trim();
    }

    private static void ExtractPlainTextRecursive(CvTiptapNode node, StringBuilder sb)
    {
        if (!string.IsNullOrEmpty(node.Text))
        {
            sb.Append(node.Text);
        }

        if (node.Content is null || node.Content.Count == 0)
        {
            return;
        }

        for (var i = 0; i < node.Content.Count; i++)
        {
            var child = node.Content[i];
            ExtractPlainTextRecursive(child, sb);
            if (IsBlockNode(child.Type))
            {
                sb.Append(' ');
            }
        }
    }

    /// <summary>
    /// Performs an independent recursive deep clone of a Tiptap document.
    /// </summary>
    public static CvTiptapDocument DeepClone(CvTiptapDocument? doc)
    {
        if (doc is null)
        {
            return Empty();
        }

        return new CvTiptapDocument
        {
            Type = doc.Type,
            Text = doc.Text,
            Attrs = doc.Attrs is null ? null : new Dictionary<string, object?>(doc.Attrs),
            Marks = doc.Marks?.Select(CloneMark).ToList(),
            Content = doc.Content?.Select(DeepCloneNode).ToList()
        };
    }

    /// <summary>
    /// Performs an independent recursive deep clone of a generic Tiptap node.
    /// </summary>
    public static CvTiptapNode DeepCloneNode(CvTiptapNode node) => new()
    {
        Type = node.Type,
        Text = node.Text,
        Attrs = node.Attrs is null ? null : new Dictionary<string, object?>(node.Attrs),
        Marks = node.Marks?.Select(CloneMark).ToList(),
        Content = node.Content?.Select(DeepCloneNode).ToList()
    };

    private static CvTiptapMark CloneMark(CvTiptapMark mark) => new()
    {
        Type = mark.Type,
        Attrs = mark.Attrs is null ? null : new Dictionary<string, object?>(mark.Attrs)
    };

    public static bool IsBlockNode(string? type) => CvTiptapSchema.IsBlockNode(type);

    public static bool IsValidNodeType(string? type) =>
        !string.IsNullOrWhiteSpace(type) && CvTiptapSchema.SupportedNodeTypes.Contains(type);

    public static bool IsValidMarkType(string? type) =>
        !string.IsNullOrWhiteSpace(type) && CvTiptapSchema.SupportedMarkTypes.Contains(type);
}

/// <summary>
/// Represents a node within a Tiptap JSON document hierarchy.
/// </summary>
public record CvTiptapNode
{
    [JsonPropertyName("type")]
    public virtual string Type { get; init; } = CvTiptapNodeTypes.Paragraph;

    [JsonPropertyName("text")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Text { get; init; }

    [JsonPropertyName("attrs")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Dictionary<string, object?>? Attrs { get; set; }

    [JsonPropertyName("marks")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<CvTiptapMark>? Marks { get; init; }

    [JsonPropertyName("content")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public List<CvTiptapNode>? Content { get; init; }
}

/// <summary>
/// Represents formatting marks (bold, italic, link, etc.) applied to a Tiptap text node.
/// </summary>
public sealed record CvTiptapMark
{
    [JsonPropertyName("type")]
    public string Type { get; init; } = string.Empty;

    [JsonPropertyName("attrs")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Dictionary<string, object?>? Attrs { get; set; }
}

/// <summary>
/// Custom JSON converter for CvTiptapDocument that provides backward compatibility.
/// When encountering legacy string data (or null/primitive), it automatically converts to a valid Tiptap document.
/// When encountering a JSON object, it deserializes the full Tiptap tree.
/// </summary>
public sealed class CvTiptapDocumentJsonConverter : JsonConverter<CvTiptapDocument>
{
    public override CvTiptapDocument? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null)
        {
            return CvTiptapDocument.Empty();
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var text = reader.GetString();
            return string.IsNullOrEmpty(text) ? CvTiptapDocument.Empty() : CvTiptapDocument.FromText(text);
        }

        if (reader.TokenType == JsonTokenType.Number)
        {
            using var numDoc = JsonDocument.ParseValue(ref reader);
            return CvTiptapDocument.FromText(numDoc.RootElement.GetRawText());
        }

        if (reader.TokenType == JsonTokenType.True || reader.TokenType == JsonTokenType.False)
        {
            return CvTiptapDocument.FromText(reader.GetBoolean().ToString().ToLowerInvariant());
        }

        if (reader.TokenType == JsonTokenType.StartObject)
        {
            using var doc = JsonDocument.ParseValue(ref reader);
            var root = doc.RootElement;

            var type = root.TryGetProperty("type", out var typeProp) && typeProp.ValueKind == JsonValueKind.String
                ? typeProp.GetString() ?? CvTiptapNodeTypes.Doc
                : CvTiptapNodeTypes.Doc;

            Dictionary<string, object?>? attrs = null;
            if (root.TryGetProperty("attrs", out var attrsProp) && attrsProp.ValueKind == JsonValueKind.Object)
            {
                attrs = JsonSerializer.Deserialize<Dictionary<string, object?>>(attrsProp.GetRawText(), options);
            }

            string? text = null;
            if (root.TryGetProperty("text", out var textProp) && textProp.ValueKind == JsonValueKind.String)
            {
                text = textProp.GetString();
            }

            List<CvTiptapMark>? marks = null;
            if (root.TryGetProperty("marks", out var marksProp) && marksProp.ValueKind == JsonValueKind.Array)
            {
                marks = JsonSerializer.Deserialize<List<CvTiptapMark>>(marksProp.GetRawText(), options);
            }

            List<CvTiptapNode>? content = null;
            if (root.TryGetProperty("content", out var contentProp) && contentProp.ValueKind == JsonValueKind.Array)
            {
                content = JsonSerializer.Deserialize<List<CvTiptapNode>>(contentProp.GetRawText(), options);
            }

            return new CvTiptapDocument
            {
                Type = type,
                Attrs = attrs,
                Text = text,
                Marks = marks,
                Content = content
            };
        }

        throw new JsonException($"Unexpected token '{reader.TokenType}' when deserializing CvTiptapDocument.");
    }

    public override void Write(Utf8JsonWriter writer, CvTiptapDocument value, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        writer.WriteString("type", value.Type ?? CvTiptapNodeTypes.Doc);

        if (value.Attrs != null)
        {
            writer.WritePropertyName("attrs");
            JsonSerializer.Serialize(writer, value.Attrs, options);
        }

        if (value.Text != null)
        {
            writer.WriteString("text", value.Text);
        }

        if (value.Marks != null)
        {
            writer.WritePropertyName("marks");
            JsonSerializer.Serialize(writer, value.Marks, options);
        }

        if (value.Content != null)
        {
            writer.WritePropertyName("content");
            JsonSerializer.Serialize(writer, value.Content, options);
        }

        writer.WriteEndObject();
    }
}
