using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustries;
using SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustryGroups;
using SmartHire.Application.Features.IndustryCatalog.Queries.GetIndustryGroupsWithIndustries;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1")]
[AllowAnonymous]
public class IndustryCatalogController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;
    
    public IndustryCatalogController(ISender sender, ApiResponseFactory responseFactory)
    {
        _sender = sender;
        _responseFactory = responseFactory;
    }
    
    [HttpGet("industry-groups")]
    public async Task<IActionResult> GetIndustryGroups(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetIndustryGroupsQuery(search, page, pageSize), cancellationToken);
        
        return Ok(_responseFactory.PagedOneBased(
            result.Items, result.Page, result.PageSize, result.TotalItems));
    }
    
    [HttpGet("industry-groups/with-industries")]
    public async Task<IActionResult> GetIndustryGroupsWithIndustries(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetIndustryGroupsWithIndustriesQuery(search, page, pageSize), cancellationToken);
        
        return Ok(_responseFactory.PagedOneBased(
            result.Items, result.Page, result.PageSize, result.TotalItems));
    }
    
    [HttpGet("industries")]
    public async Task<IActionResult> GetIndustries(
        [FromQuery] Guid? groupId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetIndustriesQuery(groupId, search, page, pageSize), cancellationToken);
        
        return Ok(_responseFactory.PagedOneBased(
            result.Items, result.Page, result.PageSize, result.TotalItems));
    }
}
