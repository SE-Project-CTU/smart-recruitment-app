using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.LocationCatalog.DTOs;
using SmartHire.Application.Features.LocationCatalog.Validation;

namespace SmartHire.Application.Features.LocationCatalog.Queries.GetProvinces;

public sealed class GetProvincesQueryHandler
    : IRequestHandler<GetProvincesQuery, LocationCatalogPageResult<ProvinceResult>>
{
    private readonly ILocationCatalogRepository _repository;

    public GetProvincesQueryHandler(ILocationCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<LocationCatalogPageResult<ProvinceResult>> Handle(
        GetProvincesQuery request,
        CancellationToken cancellationToken)
    {
        var page = LocationCatalogQueryValidator.Validate(
            request.Page, request.PageSize, request.Search);
        var (provinces, totalItems) = await _repository.GetActiveProvincesAsync(
            page.Search, page.Skip, page.PageSize, cancellationToken);

        var items = provinces
            .Select(province => new ProvinceResult(
                province.Id,
                province.Name,
                province.Status.ToString(),
                province.IsCentrallyGoverned))
            .ToList();

        return new LocationCatalogPageResult<ProvinceResult>(
            items, page.Page, page.PageSize, totalItems);
    }
}
