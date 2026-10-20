namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record JobPostingSearchItem(
    Guid Id,
    Guid CompanyId,
    string CompanyName,
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
