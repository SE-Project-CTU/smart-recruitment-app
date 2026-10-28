using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanies;

public sealed record ListCompaniesQuery(
    string? Search,
    CompanyVerificationStatus? Status,
    PaginationParams Pagination
) : IRequest<(IReadOnlyList<CompanyResult> Items, int TotalCount)>;
