using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Application.Features.JobPostings.Exceptions;

namespace SmartHire.Application.Features.JobPostings.Queries.ListMyBookmarkedJobs;

public sealed class ListMyBookmarkedJobsQueryHandler
    : IRequestHandler<ListMyBookmarkedJobsQuery, (IReadOnlyList<BookmarkedJobResult> Items, int TotalCount)> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobBookmarkRepository _jobBookmarkRepository;

    public ListMyBookmarkedJobsQueryHandler(
        ICurrentUser currentUser,
        IJobBookmarkRepository jobBookmarkRepository) {
        _currentUser = currentUser;
        _jobBookmarkRepository = jobBookmarkRepository;
    }

    public async Task<(IReadOnlyList<BookmarkedJobResult> Items, int TotalCount)> Handle(
        ListMyBookmarkedJobsQuery request,
        CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw JobPostingExceptions.InvalidAccessToken();

        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _jobBookmarkRepository.GetMyBookmarkedJobsPagedAsync(
            userId,
            search,
            page,
            pageSize,
            cancellationToken);
    }
}

