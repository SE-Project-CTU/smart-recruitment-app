namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record SearchJobProvinceSummary(
    Guid Id,
    string Name);

public sealed record SearchJobWardSummary(
    Guid Id,
    string Name);

public sealed record JobPostingSearchItem(
    Guid Id,
    SearchJobCompanySummary Company,
    string Title,
    SearchJobProvinceSummary Province,
    SearchJobWardSummary? Ward,
    int? ExperienceYears,
    string? JobLevel,
    string WorkMode,
    string JobType,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset? Deadline,
    string Status,
    IReadOnlyList<string> SkillNames,
    IReadOnlyList<string> IndustryNames,
    DateTimeOffset CreatedAt);

public record SearchJobCompanySummary(
    Guid Id,
    string Name,
    string? LogoFileUrl
);
