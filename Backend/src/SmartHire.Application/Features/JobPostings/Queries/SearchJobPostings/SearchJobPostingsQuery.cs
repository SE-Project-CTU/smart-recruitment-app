using MediatR;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.JobPostings.DTOs;

namespace SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;

public sealed record SearchJobPostingsQuery(
    string? Keyword,
    string? Company,
    Guid? CompanyId,
    decimal? SalaryMin,
    decimal? SalaryMax,
    Guid? ProvinceId,
    Guid? WardId,
    string? JobLevel,
    string? JobType,
    string? WorkMode,
    int? ExperienceYears,
    string? Sort,
    string? Direction,
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20) : IRequest<SearchJobPostingsPage>;

public sealed record SearchJobPostingsPage(
    IReadOnlyList<JobPostingSearchItem> Items,
    int Page,
    int PageSize,
    int TotalCount);

public sealed record SearchJobPostingsCriteria(
    string? Keyword,
    string? Company,
    Guid? CompanyId,
    decimal? SalaryMin,
    decimal? SalaryMax,
    Guid? ProvinceId,
    Guid? WardId,
    SmartHire.Domain.Enums.JobLevel? JobLevel,
    SmartHire.Domain.Enums.JobType? JobType,
    SmartHire.Domain.Enums.WorkMode? WorkMode,
    int? ExperienceYears,
    SearchJobPostingsSort Sort,
    SortDirection Direction,
    int Skip,
    int PageSize,
    DateTimeOffset Now);

public enum SearchJobPostingsSort {
    CreatedAt,
    SalaryMax
}
