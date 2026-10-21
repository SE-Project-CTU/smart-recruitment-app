using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Applications.Commands.UpdateApplicationStatus;
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

    [Authorize(Roles = RoleNames.Recruiter)]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] UpdateApplicationStatusRequest? request,
        CancellationToken cancellationToken) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.",
                [new AppErrorDetail("body", ValidationReasons.Required,
                    "Request body is required.")]);
        }

        var result = await sender.Send(
            new UpdateApplicationStatusCommand(id, request.Status, request.Note),
            cancellationToken);
        return Ok(responseFactory.Success(result));
    }
}
