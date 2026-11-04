using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record JobPostingDetailData(
    Guid Id,
    CreatorReadModel Creator,
    string Title,
    string Description,
    string Requirements,
    string? Benefits,
    int? ExperienceYears,
    JobLevel? JobLevel,
    EducationLevel? EducationLevel,
    int Vacancies,
    WorkMode WorkMode,
    JobType JobType,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset? Deadline,
    JobPostingStatus Status,
    CompanyReadModel Company,
    LocationReadModel Location,
    IReadOnlyList<IndustryReadModel> Industries,
    IReadOnlyList<SkillReadModel> Skills,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public sealed record CreatorReadModel(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl);

public sealed record CompanyReadModel(
    Guid Id,
    string Name,
    CompanyVerificationStatus VerificationStatus,
    string? Address,
    string? LogoUrl);

public sealed record LocationReadModel(
    Guid ProvinceId,
    string ProvinceName,
    Guid? WardId,
    string? WardName,
    string? DetailedLocation);

public sealed record IndustryReadModel(Guid Id, string Name);

public sealed record SkillReadModel(Guid Id, string Name);
