using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.JobPostings.DTOs;

namespace SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;

public sealed record SearchJobPostingsQuery(
    JobPostingSearchFilter Filter,
    JobPostingSearchSort Sort,
    PaginationParams Pagination) : IRequest<SearchJobPostingsPage>;
