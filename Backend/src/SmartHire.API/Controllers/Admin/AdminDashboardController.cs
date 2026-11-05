using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Dashboard.Queries.GetDashboardOverview;

namespace SmartHire.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin/dashboard")]
public sealed class AdminDashboardController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public AdminDashboardController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    /// <summary>
    /// Xem dashboard thống kê vận hành toàn hệ thống (Users, Companies, Job Postings, Applications)
    /// </summary>
    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview(
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        CancellationToken cancellationToken = default) {
        var query = new GetDashboardOverviewQuery(from, to);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
}

