using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyFollowers;

public sealed record ListCompanyFollowersQuery(
    Guid CompanyId,
    int Page = 1,
    int PageSize = 20
) : IRequest<(CompanyFollowersResponse Response, int TotalCount)>;
