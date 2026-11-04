using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListFollowedCompanies;

public sealed record ListFollowedCompaniesQuery(
    string? Search,
    PaginationParams Pagination
) : IRequest<(IReadOnlyList<FollowedCompanyResult> Items, int TotalCount)>;
