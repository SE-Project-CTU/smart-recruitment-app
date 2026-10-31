using System.Text.Json.Serialization;

namespace SmartHire.Domain.ValueObjects.Cv;

/// <summary>
/// Defines the global document styling for a CV.
/// </summary>
public sealed record CvDefaultStyle
{
    [JsonPropertyName("fontFamily")]
    public string FontFamily { get; init; } = "Inter, sans-serif";

    [JsonPropertyName("fontScale")]
    public float FontScale { get; init; } = 1.0f;

    [JsonPropertyName("primaryColors")]
    public List<string> PrimaryColors { get; init; } = ["#2563EB", "#1D4ED8"];

    [JsonPropertyName("lineHeight")]
    public float LineHeight { get; init; } = 1.5f;

    public static CvDefaultStyle DeepClone(CvDefaultStyle? style)
    {
        if (style is null)
        {
            return new CvDefaultStyle();
        }

        return new CvDefaultStyle
        {
            FontFamily = style.FontFamily,
            FontScale = style.FontScale,
            PrimaryColors = style.PrimaryColors is null ? [] : [.. style.PrimaryColors],
            LineHeight = style.LineHeight
        };
    }
}
