namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record JobPostingSearchItem(
    Guid Id,
    SearchJobCompanySummary Company,
    string Title,
    Guid ProvinceId,
    Guid? WardId,
    int? ExperienceYears,
    string? JobLevel,
    string WorkMode,
    string JobType,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset? Deadline,
    string Status,
    DateTimeOffset CreatedAt);

public record SearchJobCompanySummary(
    Guid Id,
    string Name,
    string? LogoFileUrl
);