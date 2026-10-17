using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListJoinRequests;

public sealed record ListJoinRequestsQuery(
    Guid CompanyId,
    string? Status,
    int Page = 1,
    int PageSize = 20
) : IRequest<(IReadOnlyList<CompanyJoinRequestResult> Items, int TotalCount)>;
