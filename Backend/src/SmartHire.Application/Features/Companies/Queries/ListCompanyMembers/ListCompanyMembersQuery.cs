using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyMembers;

public sealed record ListCompanyMembersQuery(
    Guid CompanyId,
    int Page = 1,
    int PageSize = 20,
    string? Status = "Active"
) : IRequest<(IReadOnlyList<CompanyMemberResult> Items, int TotalCount)>;
