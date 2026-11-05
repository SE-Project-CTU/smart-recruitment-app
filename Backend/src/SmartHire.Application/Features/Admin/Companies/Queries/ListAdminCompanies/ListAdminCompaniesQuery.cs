using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.Companies.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Companies.Queries.ListAdminCompanies;

public sealed record ListAdminCompaniesQuery(
    string? Search = null,
    CompanyVerificationStatus? Status = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<AdminCompanyItemDto> Items, int TotalCount)>;
