using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record SearchJobProvinceData(
    Guid Id,
    string Name);

public sealed record SearchJobWardData(
    Guid Id,
    string Name);

public sealed record JobPostingSearchData(
    Guid Id,
    SearchJobCompanySummaryData Company,
    string Title,
    SearchJobProvinceData Province,
    SearchJobWardData? Ward,
    int? ExperienceYears,
    JobLevel? JobLevel,
    WorkMode WorkMode,
    JobType JobType,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset? Deadline,
    JobPostingStatus Status,
    IReadOnlyList<string> SkillNames,
    IReadOnlyList<string> IndustryNames,
    DateTimeOffset CreatedAt);

public record SearchJobCompanySummaryData(
    Guid Id,
    string Name,
    string? LogoFileUrl
);
