namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record JobPostingCreatorResult(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl);

public sealed record CompanySummary(
    Guid Id,
    string Name,
    string? Address,
    string? LogoUrl);

public sealed record ProvinceSummary(Guid Id, string Name);

public sealed record WardSummary(Guid Id, string Name);

public sealed record IndustrySummary(Guid Id, string Name);

public sealed record SkillSummary(Guid Id, string Name);

public sealed record JobPostingDetailResult(
    Guid Id,
    string Title,
    string Description,
    string Requirements,
    string? Benefits,
    CompanySummary Company,
    JobPostingCreatorResult Creator,
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
    IReadOnlyList<IndustrySummary> Industries,
    IReadOnlyList<SkillSummary> Skills,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    bool HasApplied,
    Guid? ApplicationId,
    bool IsFollowingCompany);
