namespace SmartHire.Application.Abstractions.Ai;

public sealed record CvEnhanceRequest(
    string? Content,
    string? SectionType = null,
    string? TargetJobTitle = null,
    string? CvContext = null,
    string? JobContext = null,
    string Language = "vi"
);

public sealed record CvEnhanceResult(
    string OriginalContent,
    string EnhancedContent,
    IReadOnlyList<string> SuggestedKeywords,
    IReadOnlyList<string> Improvements,
    string? DetectedSection = null,
    string? ConversationTitle = null
);

public sealed record CvSectionBatchItem(
    string SectionType,
    string Content
);

public sealed record CvBatchEnhanceRequest(
    IReadOnlyList<CvSectionBatchItem> Sections,
    string? TargetJobTitle = null,
    string? CvContext = null,
    string? JobContext = null,
    string Language = "vi"
);

public sealed record CvBatchEnhanceResult(
    IReadOnlyList<CvSectionEnhancedResult> Sections
);

public sealed record CvSectionEnhancedResult(
    string SectionType,
    string OriginalContent,
    string EnhancedContent,
    IReadOnlyList<string> SuggestedKeywords,
    IReadOnlyList<string> Improvements
);

public sealed record MatchAnalysisResult(
    decimal Score,
    string Summary,
    IReadOnlyList<string> MatchingSkills,
    IReadOnlyList<string> MissingSkills,
    IReadOnlyList<string> Strengths,
    IReadOnlyList<string> Recommendations
);

public sealed record RerankCandidate(
    Guid Id,
    string Text
);

public sealed record RerankResultItem(
    Guid Id,
    decimal Score,
    int Index
);
