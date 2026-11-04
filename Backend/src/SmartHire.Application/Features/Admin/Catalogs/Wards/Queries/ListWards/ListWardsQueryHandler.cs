using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Wards.Queries.ListWards;

public sealed class ListWardsQueryHandler
    : IRequestHandler<ListWardsQuery, (IReadOnlyList<AdminWardDto> Items, int TotalCount)> {
    private readonly ILocationCatalogRepository _repository;

    public ListWardsQueryHandler(ILocationCatalogRepository repository) {
        _repository = repository;
    }

    public async Task<(IReadOnlyList<AdminWardDto> Items, int TotalCount)> Handle(
        ListWardsQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _repository.GetAdminWardsPagedAsync(
            request.ProvinceId,
            search,
            request.Status,
            page,
            pageSize,
            cancellationToken);
    }
}

