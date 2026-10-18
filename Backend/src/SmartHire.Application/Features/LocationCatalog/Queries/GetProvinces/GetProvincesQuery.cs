using MediatR;
using SmartHire.Application.Features.LocationCatalog.DTOs;

namespace SmartHire.Application.Features.LocationCatalog.Queries.GetProvinces;

public sealed record GetProvincesQuery(
    string? Search,
    int Page = 1,
    int PageSize = 50) : IRequest<LocationCatalogPageResult<ProvinceResult>>;
