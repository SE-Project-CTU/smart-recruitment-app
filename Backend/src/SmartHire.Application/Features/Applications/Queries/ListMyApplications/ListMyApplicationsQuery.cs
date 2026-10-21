using MediatR;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Queries.ListMyApplications;

public sealed record ListMyApplicationsQuery(
    string? Status = null,
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20,
    string? Sort = null,
    string? Direction = null) : IRequest<MyApplicationsPageResult>;

public enum MyApplicationsSort {
    AppliedAt,
    UpdatedAt
}

public enum MyApplicationsDirection {
    Asc,
    Desc
}

public sealed record ValidatedListMyApplicationsQuery(
    int Page,
    int PageSize,
    int Skip,
    ApplicationStatus? Status,
    MyApplicationsSort Sort,
    MyApplicationsDirection Direction);
