namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record ApplicationCompanySummaryResult(
    Guid Id,
    string Name,
    string? LogoUrl);

public sealed record ApplicationJobSummaryResult(
    Guid Id,
    string Title,
    ApplicationCompanySummaryResult Company,
    Guid ProvinceId,
    string ProvinceName,
    int? ExperienceYears,
    string? JobLevel,
    string WorkMode,
    string JobType,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset? Deadline,
    string Status);
