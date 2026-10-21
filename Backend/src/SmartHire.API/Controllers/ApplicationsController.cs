using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Applications.Queries.GetApplicationDetail;
using SmartHire.Application.Features.Applications.Queries.ListMyApplications;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1/applications")]
public sealed class ApplicationsController(ISender sender, ApiResponseFactory responseFactory) : ControllerBase {
    [Authorize(Roles = RoleNames.Candidate)]
    [HttpGet("me")]
    public async Task<IActionResult> List(
        [FromQuery] string? status,
        [FromQuery] int page = PagedListQueryValidator.FirstPage,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sort = null,
        [FromQuery] string? direction = null,
        CancellationToken cancellationToken = default) {
        var result = await sender.Send(
            new ListMyApplicationsQuery(status, page, pageSize, sort, direction),
            cancellationToken);

        return Ok(responseFactory.PagedOneBased(
            result.Items,
            result.Page,
            result.PageSize,
            result.TotalItems));
    }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken) {
        var result = await sender.Send(new GetApplicationDetailQuery(id), cancellationToken);
        return Ok(responseFactory.Success(result));
    }
}
