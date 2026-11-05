using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.JobPostings.DTOs;

namespace SmartHire.Application.Features.JobPostings.Queries.ListMyBookmarkedJobs;

public sealed record ListMyBookmarkedJobsQuery(
    string? Search,
    PaginationParams? Pagination
) : IRequest<(IReadOnlyList<BookmarkedJobResult> Items, int TotalCount)>;

