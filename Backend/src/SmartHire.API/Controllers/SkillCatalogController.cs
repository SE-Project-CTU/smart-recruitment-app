using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Features.SkillCatalog.Queries.GetSkills;

namespace SmartHire.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v1/skills")]
public sealed class SkillCatalogController : ControllerBase
{
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public SkillCatalogController(ISender sender, ApiResponseFactory responseFactory)
    {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    [HttpGet]
    public async Task<IActionResult> GetSkills(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetSkillsQuery(search, page, pageSize), cancellationToken);

        return Ok(_responseFactory.PagedOneBased(
            result.Items, result.Page, result.PageSize, result.TotalItems));
    }
}
