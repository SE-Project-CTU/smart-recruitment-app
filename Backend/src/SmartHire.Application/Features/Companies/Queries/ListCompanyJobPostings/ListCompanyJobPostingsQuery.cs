using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyJobPostings;

public sealed record ListCompanyJobPostingsQuery(
    Guid CompanyId,
    string? Status,
    string? Search,
    PaginationParams Pagination
) : IRequest<(IReadOnlyList<CompanyJobPostingResult> Items, int TotalCount)>;
