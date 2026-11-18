namespace SmartHire.Infrastructure.Ai;

internal sealed class GeminiGenerateContentResponse {
    public List<Candidate>? Candidates { get; set; }
}

internal sealed class Candidate {
    public Content? Content { get; set; }
}

internal sealed class Content {
    public List<Part>? Parts { get; set; }
}

internal sealed class Part {
    public string? Text { get; set; }
}

internal sealed class GeminiEmbedResponse {
    public EmbeddingData? Embedding { get; set; }
}

internal sealed class EmbeddingData {
    public float[]? Values { get; set; }
}

internal sealed class CvEnhanceJsonResult {
    public string? DetectedSection { get; set; }
    public string? ConversationTitle { get; set; }
    public string? OriginalContent { get; set; }
    public string? EnhancedContent { get; set; }
    public List<string>? SuggestedKeywords { get; set; }
    public List<string>? Improvements { get; set; }
}

internal sealed class CvBatchEnhanceJsonResult {
    public List<CvBatchSectionItemJson>? Sections { get; set; }
}

internal sealed class CvBatchSectionItemJson {
    public string? SectionType { get; set; }
    public string? EnhancedContent { get; set; }
    public List<string>? Improvements { get; set; }
    public List<string>? AdditionalSuggestions { get; set; }
}

internal sealed class MatchAnalysisJsonResult {
    public string? Summary { get; set; }
    public List<string>? MatchingSkills { get; set; }
    public List<string>? MissingSkills { get; set; }
    public List<string>? Strengths { get; set; }
    public List<string>? Recommendations { get; set; }
}
