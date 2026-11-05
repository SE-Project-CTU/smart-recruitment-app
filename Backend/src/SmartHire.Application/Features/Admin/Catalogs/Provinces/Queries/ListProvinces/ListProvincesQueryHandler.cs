using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Provinces.Queries.ListProvinces;

public sealed class ListProvincesQueryHandler
    : IRequestHandler<ListProvincesQuery, (IReadOnlyList<AdminProvinceDto> Items, int TotalCount)> {
    private readonly ILocationCatalogRepository _repository;

    public ListProvincesQueryHandler(ILocationCatalogRepository repository) {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<AdminProvinceDto> Items, int TotalCount)> Handle(
        ListProvincesQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _repository.GetAdminProvincesPagedAsync(
            search,
            request.Status,
            page,
            pageSize,
            cancellationToken);
    }
}

