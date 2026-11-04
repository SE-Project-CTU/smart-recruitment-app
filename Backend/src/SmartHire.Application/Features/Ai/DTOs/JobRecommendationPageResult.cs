namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record JobRecommendationPageResult(
    IReadOnlyList<JobRecommendationItemResult> Items,
    int Page,
    int PageSize,
    int TotalItems
);

