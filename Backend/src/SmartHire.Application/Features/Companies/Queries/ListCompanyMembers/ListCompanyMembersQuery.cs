using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyMembers;

public sealed record ListCompanyMembersQuery(
    Guid CompanyId,
    PaginationParams Pagination,
    string? Status = "Active"
) : IRequest<(IReadOnlyList<CompanyMemberResult> Items, int TotalCount)>;
