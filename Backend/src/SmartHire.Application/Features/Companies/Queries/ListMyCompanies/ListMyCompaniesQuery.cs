using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListMyCompanies;

public sealed record ListMyCompaniesQuery(
    string? Search,
    PaginationParams Pagination
) : IRequest<(IReadOnlyList<CompanyResult> Items, int TotalCount)>;
