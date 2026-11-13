namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record EnhanceCvBatchItemResult(
    string SectionType,
    string OriginalContent,
    string EnhancedContent,
    IReadOnlyList<string> Improvements,
    IReadOnlyList<string> AdditionalSuggestions
);

