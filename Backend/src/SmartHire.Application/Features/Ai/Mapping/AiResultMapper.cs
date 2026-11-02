using SmartHire.Application.Abstractions.Ai;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Mapping;

public static class AiResultMapper {
    public static EnhanceCvResult ToEnhanceCvResult(CvEnhanceResult source) =>
        CvEnhanceMapper.ToEnhanceCvResult(source);

    public static EnhanceCvBatchResult ToEnhanceCvBatchResult(CvBatchEnhanceResult source) =>
        CvEnhanceMapper.ToEnhanceCvBatchResult(source);

    public static MatchAnalysisResultDto ToMatchAnalysisResultDto(MatchAnalysisResult source) =>
        AiMatchAnalysisMapper.ToMatchAnalysisResultDto(source);

    public static ApplicationMatchResultDto ToApplicationMatchResultDto(AiMatchResult source) =>
        AiMatchAnalysisMapper.ToApplicationMatchResultDto(source);

    public static JobRecommendationItemResult ToJobRecommendationItemResult(JobRecommendation source) =>
        JobRecommendationMapper.ToJobRecommendationItemResult(source);

    public static JobRecommendationPageResult ToJobRecommendationPageResult(
        IReadOnlyList<JobRecommendation> items,
        int page,
        int pageSize,
        int totalItems) =>
        JobRecommendationMapper.ToJobRecommendationPageResult(items, page, pageSize, totalItems);
}
