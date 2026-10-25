using SmartHire.Application.Common.Sorting;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.Criteria;

public enum JobPostingSortField {
    CreatedAt,
    SalaryMax
}

public sealed record JobPostingSearchFilterCriteria(
    string? Keyword,
    string? Company,
    Guid? CompanyId,
    decimal? SalaryMin,
    decimal? SalaryMax,
    Guid? ProvinceId,
    Guid? WardId,
    JobLevel? JobLevel,
    JobType? JobType,
    WorkMode? WorkMode,
    int? ExperienceYears);

public sealed record JobPostingSearchSortCriteria(
    JobPostingSortField Sort,
    SortDirection Direction);

public sealed record JobPostingSearchCriteria(
    JobPostingSearchFilterCriteria Filter,
    JobPostingSearchSortCriteria Sort,
    PaginationCriteria Pagination,
    DateTimeOffset Now);
