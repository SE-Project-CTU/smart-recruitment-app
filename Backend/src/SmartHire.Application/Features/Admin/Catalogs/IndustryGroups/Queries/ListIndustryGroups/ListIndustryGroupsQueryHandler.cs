using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Queries.ListIndustryGroups;

public sealed class ListIndustryGroupsQueryHandler
    : IRequestHandler<ListIndustryGroupsQuery, (IReadOnlyList<AdminIndustryGroupDto> Items, int TotalCount)> {
    private readonly IIndustryCatalogRepository _repository;

    public ListIndustryGroupsQueryHandler(IIndustryCatalogRepository repository) {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<AdminIndustryGroupDto> Items, int TotalCount)> Handle(
        ListIndustryGroupsQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _repository.GetAdminIndustryGroupsPagedAsync(
            search,
            request.IsActive,
            page,
            pageSize,
            cancellationToken);
    }
}

