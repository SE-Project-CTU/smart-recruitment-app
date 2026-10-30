using System.Text;
using System.Text.Json.Serialization;

namespace SmartHire.Domain.ValueObjects.Cv;

/// <summary>
/// Root node of a Tiptap document tree.
/// </summary>
public sealed record CvTiptapDocument : CvTiptapNode
{
    [JsonPropertyName("type")]
    public override string Type { get; init; } = CvTiptapNodeTypes.Doc;

    public static CvTiptapDocument Empty() => new()
    {
        Type = CvTiptapNodeTypes.Doc,
        Content = [new CvTiptapNode { Type = CvTiptapNodeTypes.Paragraph }]
    };

    public static CvTiptapDocument FromText(string text) => new()
    {
        Type = CvTiptapNodeTypes.Doc,
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
    public Dictionary<string, object?>? Attrs { get; init; }

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
    public Dictionary<string, object?>? Attrs { get; init; }
}
