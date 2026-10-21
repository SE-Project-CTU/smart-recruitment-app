using MediatR;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Queries.ListApplicationsForJob;

public sealed record ListApplicationsForJobQuery(
    string? JobPostingId,
    string? Status = null,
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20) : IRequest<JobApplicationsPageResult>;

public sealed record ValidatedListApplicationsForJobQuery(
    Guid JobPostingId,
    ApplicationStatus? Status,
    int Page,
    int PageSize,
    int Skip);
