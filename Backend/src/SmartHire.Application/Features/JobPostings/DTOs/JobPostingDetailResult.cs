namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record JobPostingDetailResult(
    Guid Id,
    Guid CompanyId,
    CompanySummary Company,
    Guid CreatedBy,
    string Title,
    string Description,
    string Requirements,
    string? Benefits,
    ProvinceSummary Province,
    WardSummary? Ward,
    string? DetailedLocation,
    int? ExperienceYears,
    string? JobLevel,
    string? EducationLevel,
    int Vacancies,
    string WorkMode,
    string JobType,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset? Deadline,
    string Status,
    IReadOnlyList<Guid> IndustryIds,
    IReadOnlyList<SkillSummary> Skills,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record CompanySummary(
    Guid Id,
    string Name,
    string? Address,
    string? LogoUrl);

public sealed record ProvinceSummary(Guid Id, string Name);

public sealed record WardSummary(Guid Id, string Name);

public sealed record SkillSummary(Guid Id, string Name);
