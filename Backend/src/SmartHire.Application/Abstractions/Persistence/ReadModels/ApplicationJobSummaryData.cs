using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record ApplicationCompanySummaryData(
    Guid Id,
    string Name,
    string? LogoUrl);

public sealed record ApplicationJobSummaryData(
    Guid Id,
    string Title,
    ApplicationCompanySummaryData Company,
    Guid ProvinceId,
    string ProvinceName,
    int? ExperienceYears,
    JobLevel? JobLevel,
    WorkMode WorkMode,
    JobType JobType,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset? Deadline,
    JobPostingStatus Status);
