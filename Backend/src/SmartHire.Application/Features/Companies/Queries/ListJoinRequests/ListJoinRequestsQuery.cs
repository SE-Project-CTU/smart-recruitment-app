using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListJoinRequests;

public sealed record ListJoinRequestsQuery(
    Guid CompanyId,
    string? Status,
    PaginationParams Pagination
) : IRequest<(IReadOnlyList<CompanyJoinRequestResult> Items, int TotalCount)>;
