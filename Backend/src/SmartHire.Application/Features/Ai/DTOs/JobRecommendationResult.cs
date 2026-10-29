namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record JobRecommendationPageResult(
    IReadOnlyList<JobRecommendationItemResult> Items,
    int Page,
    int PageSize,
    int TotalItems
);

public sealed record JobRecommendationItemResult(
    Guid Id,
    decimal Score,
    DateTimeOffset GeneratedAt,
    RecommendedJobPostingResult JobPosting
);

public sealed record RecommendedJobPostingResult(
    Guid Id,
    string Title,
    string CompanyName,
    string? LogoUrl,
    RecommendedLocationResult Province,
    RecommendedLocationResult? Ward,
    string JobType,
    decimal? SalaryMin,
    decimal? SalaryMax,
    DateTimeOffset? Deadline
);

public sealed record RecommendedLocationResult(
    Guid Id,
    string Name,
    string? Code = null
);
