namespace SmartHire.Domain.ValueObjects.Cv;

public sealed record CvPresentationDocument {
    public CvPresentationMetadata Metadata { get; init; } = new();
    public CvPresentationStyles Styles { get; init; } = new();
}

public sealed record CvPresentationMetadata {
    public string Version { get; init; } = "1.0";
    public string TemplateId { get; init; } = string.Empty;
    public DateTimeOffset UpdatedAt { get; init; }
}

public sealed record CvPresentationStyles {
    public CvGlobalStyle Global { get; init; } = new();
    public Dictionary<string, CvFieldStyle> Fields { get; init; } = new();
}

public sealed record CvGlobalStyle {
    public string FontFamily { get; init; } = string.Empty;
    public float BaseFontSize { get; init; }
    public List<string> PrimaryColor { get; init; } = [];
    public float LineHeight { get; init; }
}

public sealed record CvFieldStyle {
    public string Color { get; init; } = string.Empty;
    public float FontSize { get; init; }
    public string FontFamily { get; init; } = string.Empty;
    public string FontWeight { get; init; } = string.Empty;
    public string FontStyle { get; init; } = string.Empty;
    public string TextDecoration { get; init; } = string.Empty;
    public string? TextAlign { get; init; }
    public string? ListStyle { get; init; }
}