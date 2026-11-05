using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.JobPostings.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.JobPostings.Queries.ListAdminJobPostings;

public sealed record ListAdminJobPostingsQuery(
    string? Search = null,
    JobPostingStatus? Status = null,
    Guid? CompanyId = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<AdminJobPostingItemDto> Items, int TotalCount)>;

