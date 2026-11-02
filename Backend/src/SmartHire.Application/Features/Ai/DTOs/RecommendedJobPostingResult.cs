namespace SmartHire.Application.Features.Ai.DTOs;

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

