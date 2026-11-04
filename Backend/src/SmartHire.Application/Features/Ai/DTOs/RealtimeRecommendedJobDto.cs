namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record RealtimeRecommendedJobDto(
    Guid Id,
    string Title,
    string CompanyName,
    string? LogoUrl,
    string Location,
    decimal? SalaryMin,
    decimal? SalaryMax,
    string? SalaryText,
    string Requirements,
    decimal Score
);

