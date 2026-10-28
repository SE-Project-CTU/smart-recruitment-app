using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record CompanyJobPostingCompanyData(
    Guid Id,
    string Name);

public sealed record CompanyJobPostingCreatorData(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl);

public sealed record CompanyJobPostingProvinceData(
    Guid Id,
    string Name);

public sealed record CompanyJobPostingWardData(
    Guid Id,
    string Name);

public sealed record CompanyJobPostingData(
    Guid Id,
    string Title,
    CompanyJobPostingCompanyData Company,
    CompanyJobPostingCreatorData Creator,
    CompanyJobPostingProvinceData Province,
    CompanyJobPostingWardData? Ward,
    string? DetailedLocation,
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
    int TotalApplications,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
