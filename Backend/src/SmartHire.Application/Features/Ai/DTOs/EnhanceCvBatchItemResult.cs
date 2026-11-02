namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record EnhanceCvBatchItemResult(
    string SectionType,
    string OriginalContent,
    string EnhancedContent,
    IReadOnlyList<string> SuggestedKeywords,
    IReadOnlyList<string> Improvements
);

