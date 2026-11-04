using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyApplications;

public sealed record ListCompanyApplicationsQuery(
    Guid CompanyId,
    CompanyApplicationFilter Filter,
    CompanyApplicationSort Sort,
    PaginationParams Pagination) : IRequest<(IReadOnlyList<CompanyApplicationListItemResult> Items, int TotalCount)>;

public enum CompanyApplicationsSort {
    AppliedAt,
    CandidateName,
    JobTitle,
    Status
}

public sealed record ValidatedListCompanyApplicationsQuery(
    Guid CompanyId,
    Guid? JobId,
    ApplicationStatus? Status,
    string? Search,
    CompanyApplicationsSort Sort,
    SortDirection Direction,
    int Page,
    int PageSize,
    int Skip);
