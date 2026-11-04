using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests.Admin;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Admin.JobPostings.Commands.ReviewJobModeration;
using SmartHire.Application.Features.Admin.JobPostings.Queries.ListAdminJobPostings;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin/job-postings")]
public sealed class AdminJobPostingsController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public AdminJobPostingsController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    /// <summary>
    /// Danh sách tin tuyển dụng cần kiểm duyệt
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetJobPostings(
        [FromQuery] string? search,
        [FromQuery] JobPostingStatus? status,
        [FromQuery] Guid? companyId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListAdminJobPostingsQuery(
            Search: search,
            Status: status,
            CompanyId: companyId,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    /// <summary>
    /// Duyệt hoặc từ chối tin tuyển dụng
    /// </summary>
    [HttpPatch("{id:guid}/moderation")]
    public async Task<IActionResult> ModerateJobPosting(
        [FromRoute] Guid id,
        [FromBody] ReviewJobModerationRequest request,
        CancellationToken cancellationToken = default) {
        if (!Enum.TryParse<JobPostingStatus>(request.Status, true, out var status)) {
            throw AdminExceptions.Validation("Invalid job posting status.", [
                new AppErrorDetail("status", ValidationReasons.NotAllowed, $"Status '{request.Status}' is invalid. Allowed: 'Published', 'Rejected'.")
            ]);
        }

        var command = new ReviewJobModerationCommand(id, status, request.RejectionReason);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
}

