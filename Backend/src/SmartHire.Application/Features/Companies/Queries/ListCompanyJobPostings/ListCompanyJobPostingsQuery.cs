using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyJobPostings;

public sealed record ListCompanyJobPostingsQuery(
    Guid CompanyId,
    string? Status = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<(IReadOnlyList<CompanyJobPostingResult> Items, int TotalCount)>;
