using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.JobPostings.DTOs;

namespace SmartHire.Application.Features.Admin.JobPostings.Queries.ListAdminJobPostings;

public sealed class ListAdminJobPostingsQueryHandler
    : IRequestHandler<ListAdminJobPostingsQuery, (IReadOnlyList<AdminJobPostingItemDto> Items, int TotalCount)> {
    private readonly IJobPostingRepository _jobPostingRepository;

    public ListAdminJobPostingsQueryHandler(IJobPostingRepository jobPostingRepository) {
        _jobPostingRepository = jobPostingRepository;
    }

    public async Task<(IReadOnlyList<AdminJobPostingItemDto> Items, int TotalCount)> Handle(
        ListAdminJobPostingsQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _jobPostingRepository.GetAdminJobPostingsPagedAsync(
            search,
            request.Status,
            request.CompanyId,
            page,
            pageSize,
            cancellationToken);
    }
}

