namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record CompanyJobPostingCompanyResult(
    Guid Id,
    string Name);

public sealed record CompanyJobPostingCreatorResult(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl);

public sealed record CompanyJobPostingProvinceResult(
    Guid Id,
    string Name);

public sealed record CompanyJobPostingWardResult(
    Guid Id,
    string Name);

public sealed record CompanyJobPostingResult(
    Guid Id,
    string Title,
    CompanyJobPostingCompanyResult Company,
    CompanyJobPostingCreatorResult Creator,
    CompanyJobPostingProvinceResult Province,
    CompanyJobPostingWardResult? Ward,
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
    int TotalApplications,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);
