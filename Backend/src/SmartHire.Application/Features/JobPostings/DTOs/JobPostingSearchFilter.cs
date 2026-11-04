namespace SmartHire.Application.Features.JobPostings.DTOs;

public sealed record JobPostingSearchFilter(
    string? Keyword = null,
    string? Company = null,
    Guid? CompanyId = null,
    decimal? SalaryMin = null,
    decimal? SalaryMax = null,
    Guid? ProvinceId = null,
    Guid? WardId = null,
    string? JobLevel = null,
    string? JobType = null,
    string? WorkMode = null,
    int? ExperienceYears = null);
