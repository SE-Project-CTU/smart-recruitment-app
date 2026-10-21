using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record JobPostingSearchData(
    Guid Id,
    Guid CompanyId,
    string CompanyName,
    string Title,
    Guid ProvinceId,
    Guid? WardId,
    int? ExperienceYears,
    JobLevel? JobLevel,
    WorkMode WorkMode,
    JobType JobType,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset? Deadline,
    JobPostingStatus Status,
    DateTimeOffset CreatedAt);
