namespace SmartHire.Application.Features.Admin.JobPostings.DTOs;

public sealed record AdminJobPostingItemDto(
    Guid Id,
    Guid CompanyId,
    string CompanyName,
    string? CompanyLogoUrl,
    Guid CreatedBy,
    string Title,
    string Status,
    string ProvinceName,
    string? WardName,
    int Vacancies,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset? Deadline,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public sealed record ReviewJobModerationResult(
    Guid Id,
    string Status,
    DateTimeOffset UpdatedAt
);
