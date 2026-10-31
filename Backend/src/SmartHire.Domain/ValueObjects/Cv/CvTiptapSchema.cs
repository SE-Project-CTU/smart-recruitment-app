namespace SmartHire.Domain.ValueObjects.Cv;

/// <summary>
/// Node types supported in Tiptap document trees.
/// </summary>
public static class CvTiptapNodeTypes
{
    public const string Doc = "doc";
    public const string Paragraph = "paragraph";
    public const string Text = "text";
    public const string BulletList = "bulletList";
    public const string OrderedList = "orderedList";
    public const string ListItem = "listItem";
    public const string HardBreak = "hardBreak";
}

/// <summary>
/// Mark formatting types supported in Tiptap text nodes.
/// </summary>
public static class CvTiptapMarkTypes
{
    public const string Bold = "bold";
    public const string Italic = "italic";
    public const string Underline = "underline";
    public const string Link = "link";
    public const string TextStyle = "textStyle";
}

/// <summary>
/// Supported attribute property names across Tiptap nodes and marks.
/// </summary>
public static class CvTiptapAttributeNames
{
    public const string TextAlign = "textAlign";
    public const string ListStyleType = "listStyleType";
    public const string Href = "href";
    public const string Target = "target";
    public const string Color = "color";
    public const string FontSize = "fontSize";
    public const string FontFamily = "fontFamily";
}

/// <summary>
/// Supported text alignment values for paragraphs.
/// </summary>
public static class CvTextAlignments
{
    public const string Left = "left";
    public const string Center = "center";
    public const string Right = "right";
    public const string Justify = "justify";
}

/// <summary>
/// Supported bullet/ordered list style types.
/// </summary>
public static class CvListStyleTypes
{
    public const string Disc = "disc";
    public const string Decimal = "decimal";
}

/// <summary>
/// Defines the strict schema, supported node/mark types, and attribute values for Tiptap documents in SmartHire.
/// </summary>
public static class CvTiptapSchema
{
    public static readonly HashSet<string> SupportedNodeTypes = new(StringComparer.Ordinal)
    {
        CvTiptapNodeTypes.Doc,
        CvTiptapNodeTypes.Paragraph,
        CvTiptapNodeTypes.Text,
        CvTiptapNodeTypes.BulletList,
        CvTiptapNodeTypes.OrderedList,
        CvTiptapNodeTypes.ListItem,
        CvTiptapNodeTypes.HardBreak
    };

    public static readonly HashSet<string> SupportedMarkTypes = new(StringComparer.Ordinal)
    {
        CvTiptapMarkTypes.Bold,
        CvTiptapMarkTypes.Italic,
        CvTiptapMarkTypes.Underline,
        CvTiptapMarkTypes.Link,
        CvTiptapMarkTypes.TextStyle
    };

    public static readonly HashSet<string> SupportedTextAlignments = new(StringComparer.OrdinalIgnoreCase)
    {
        CvTextAlignments.Left,
        CvTextAlignments.Center,
        CvTextAlignments.Right,
        CvTextAlignments.Justify
    };

    public static readonly HashSet<string> SupportedListStyleTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        CvListStyleTypes.Disc,
        CvListStyleTypes.Decimal
    };

    public static readonly HashSet<string> SupportedTextStyleAttributeNames = new(StringComparer.Ordinal)
    {
        CvTiptapAttributeNames.Color,
        CvTiptapAttributeNames.FontSize,
        CvTiptapAttributeNames.FontFamily
    };

    public static readonly HashSet<string> SupportedDocAttributeNames = new(StringComparer.Ordinal)
    {
        CvTiptapAttributeNames.FontSize
    };

    public static readonly HashSet<string> SupportedParagraphAttributeNames = new(StringComparer.Ordinal)
    {
        CvTiptapAttributeNames.TextAlign
    };

    public static readonly HashSet<string> SupportedListAttributeNames = new(StringComparer.Ordinal)
    {
        CvTiptapAttributeNames.ListStyleType
    };

    public static readonly HashSet<string> SupportedLinkAttributeNames = new(StringComparer.Ordinal)
    {
        CvTiptapAttributeNames.Href,
        CvTiptapAttributeNames.Target
    };

    /// <summary>
    /// Node types that represent structural block boundaries where word separators are required when extracting plain text.
    /// </summary>
    public static readonly HashSet<string> BlockNodeTypes = new(StringComparer.Ordinal)
    {
        CvTiptapNodeTypes.Paragraph,
        CvTiptapNodeTypes.ListItem,
        CvTiptapNodeTypes.BulletList,
        CvTiptapNodeTypes.OrderedList,
        CvTiptapNodeTypes.HardBreak
    };

    public static bool IsBlockNode(string? type) =>
        !string.IsNullOrWhiteSpace(type) && BlockNodeTypes.Contains(type);
}

public sealed record CvParagraphAttrs(string? TextAlign);

public sealed record CvListAttrs(string? ListStyleType);

public sealed record CvTextStyleAttrs(string? Color, double? FontSize, string? FontFamily);

public sealed record CvLinkAttrs(string? Href, string? Target);
