namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record EnhanceCvResult(
    string OriginalContent,
    string EnhancedContent,
    IReadOnlyList<string> SuggestedKeywords,
    IReadOnlyList<string> Improvements,
    string? DetectedSection = null
);
