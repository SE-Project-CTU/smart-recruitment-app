using MediatR;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.LocationCatalog.DTOs;

namespace SmartHire.Application.Features.LocationCatalog.Queries.GetProvinces;

public sealed record GetProvincesQuery(
    string? Search,
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 50) : IRequest<LocationCatalogPageResult<ProvinceResult>>;
