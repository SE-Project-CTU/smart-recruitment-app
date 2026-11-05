namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record BookmarkedJobResult(
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
    DateTimeOffset CreatedAt,
    DateTimeOffset BookmarkedAt,
    bool IsBookmarked = true
);

