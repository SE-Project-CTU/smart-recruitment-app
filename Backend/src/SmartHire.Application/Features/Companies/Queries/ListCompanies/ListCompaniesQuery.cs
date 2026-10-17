using MediatR;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanies;

public sealed record ListCompaniesQuery(
    string? Search,
    CompanyVerificationStatus? Status,
    int Page = 1,
    int PageSize = 20
) : IRequest<(IReadOnlyList<CompanyResult> Items, int TotalCount)>;
