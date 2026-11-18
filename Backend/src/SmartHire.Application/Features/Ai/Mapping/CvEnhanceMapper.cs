using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Mapping;

public static class CvEnhanceMapper {
    public static EnhanceCvResult ToEnhanceCvResult(CvEnhanceResult source) {
        return new EnhanceCvResult(
            OriginalContent: source.OriginalContent,
            EnhancedContent: source.EnhancedContent,
            SuggestedKeywords: source.SuggestedKeywords,
            Improvements: source.Improvements,
            DetectedSection: source.DetectedSection
        );
    }

    public static EnhanceCvBatchResult ToEnhanceCvBatchResult(CvBatchEnhanceResult source) {
        return new EnhanceCvBatchResult(
            source.Sections.Select(s => new EnhanceCvBatchItemResult(
                SectionType: s.SectionType,
                OriginalContent: s.OriginalContent,
                EnhancedContent: s.EnhancedContent,
                Improvements: s.Improvements,
                AdditionalSuggestions: s.AdditionalSuggestions
            )).ToList()
        );
    }
}

