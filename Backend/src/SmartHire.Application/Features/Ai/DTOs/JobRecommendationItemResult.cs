namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record JobRecommendationItemResult(
    Guid Id,
    decimal Score,
    DateTimeOffset GeneratedAt,
    RecommendedJobPostingResult JobPosting
);

