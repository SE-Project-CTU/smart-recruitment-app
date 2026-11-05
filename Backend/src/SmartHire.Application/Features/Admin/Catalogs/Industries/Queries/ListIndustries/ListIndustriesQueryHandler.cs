using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Industries.Queries.ListIndustries;

public sealed class ListIndustriesQueryHandler
    : IRequestHandler<ListIndustriesQuery, (IReadOnlyList<AdminIndustryDto> Items, int TotalCount)> {
    private readonly IIndustryCatalogRepository _repository;

    public ListIndustriesQueryHandler(IIndustryCatalogRepository repository) {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<AdminIndustryDto> Items, int TotalCount)> Handle(
        ListIndustriesQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _repository.GetAdminIndustriesPagedAsync(
            request.GroupId,
            search,
            request.IsActive,
            page,
            pageSize,
            cancellationToken);
    }
}

