using MediatR;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Queries.ListApplicationsForJob;

public sealed record ListApplicationsForJobQuery(
    string? JobPostingId,
    string? Status = null,
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20,
    string? Sort = null,
    string? Direction = null) : IRequest<JobApplicationsPageResult>;

public enum JobApplicationsSort {
    CreatedAt
}

public sealed record ValidatedListApplicationsForJobQuery(
    Guid JobPostingId,
    ApplicationStatus? Status,
    JobApplicationsSort Sort,
    SortDirection Direction,
    int Page,
    int PageSize,
    int Skip);
