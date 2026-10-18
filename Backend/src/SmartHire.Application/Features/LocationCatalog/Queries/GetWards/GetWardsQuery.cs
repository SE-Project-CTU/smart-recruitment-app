using MediatR;
using SmartHire.Application.Features.LocationCatalog.DTOs;

namespace SmartHire.Application.Features.LocationCatalog.Queries.GetWards;

public sealed record GetWardsQuery(
    Guid? ProvinceId,
    string? Search,
    int Page = 1,
    int PageSize = 50) : IRequest<LocationCatalogPageResult<WardResult>>;
