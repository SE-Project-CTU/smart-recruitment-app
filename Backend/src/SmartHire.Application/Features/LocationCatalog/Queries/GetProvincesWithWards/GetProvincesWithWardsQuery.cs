using MediatR;
using SmartHire.Application.Features.LocationCatalog.DTOs;

namespace SmartHire.Application.Features.LocationCatalog.Queries.GetProvincesWithWards;

public sealed record GetProvincesWithWardsQuery(
    string? Search,
    int Page = 1,
    int PageSize = 50)
    : IRequest<LocationCatalogPageResult<ProvinceWithWardsResult>>;
