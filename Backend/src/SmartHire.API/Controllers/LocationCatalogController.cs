using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Features.LocationCatalog.Queries.GetProvinces;
using SmartHire.Application.Features.LocationCatalog.Queries.GetProvincesWithWards;
using SmartHire.Application.Features.LocationCatalog.Queries.GetWards;

namespace SmartHire.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v1")]
public sealed class LocationCatalogController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;
    
    public LocationCatalogController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }
    
    [HttpGet("provinces")]
    public async Task<IActionResult> GetProvinces(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default) {
        var result = await _sender.Send(
            new GetProvincesQuery(search, page, pageSize), cancellationToken);
        
        return Ok(_responseFactory.PagedOneBased(
            result.Items, result.Page, result.PageSize, result.TotalItems));
    }

    [HttpGet("provinces/with-wards")]
    public async Task<IActionResult> GetProvincesWithWards(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default) {
        var result = await _sender.Send(
            new GetProvincesWithWardsQuery(search, page, pageSize), cancellationToken);

        return Ok(_responseFactory.PagedOneBased(
            result.Items, result.Page, result.PageSize, result.TotalItems));
    }
    
    [HttpGet("wards")]
    public async Task<IActionResult> GetWards(
        [FromQuery] Guid? provinceId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default) {
        var result = await _sender.Send(
            new GetWardsQuery(provinceId, search, page, pageSize), cancellationToken);
        
        return Ok(_responseFactory.PagedOneBased(
            result.Items, result.Page, result.PageSize, result.TotalItems));
    }
}
