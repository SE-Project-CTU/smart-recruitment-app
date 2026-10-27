using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyFollowers;

public sealed record ListCompanyFollowersQuery(
    Guid CompanyId,
    PaginationParams Pagination
) : IRequest<(CompanyFollowersResponse Response, int TotalCount)>;
