using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests.Admin;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Application.Features.Admin.Users.Commands.UpdateUserStatus;
using SmartHire.Application.Features.Admin.Users.Queries.ListAdminUsers;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin/users")]
public sealed class AdminUsersController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public AdminUsersController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    /// <summary>
    /// Tra cứu và lọc danh sách tài khoản người dùng
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] UserStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListAdminUsersQuery(
            Search: search,
            Role: role,
            Status: status,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    /// <summary>
    /// Khóa / Mở khóa tài khoản người dùng và thu hồi refresh tokens
    /// </summary>
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateUserStatus(
        [FromRoute] Guid id,
        [FromBody] UpdateUserStatusRequest request,
        CancellationToken cancellationToken = default) {
        if (!Enum.TryParse<UserStatus>(request.Status, ignoreCase: true, out var parsedStatus)) {
            throw AdminExceptions.Validation("Trạng thái người dùng không hợp lệ.", [
                new AppErrorDetail("status", ValidationReasons.InvalidFormat, "Status must be Active, Locked, or Inactive.")
            ]);
        }

        var command = new UpdateUserStatusCommand(
            UserId: id,
            Status: parsedStatus,
            Reason: request.Reason
        );

        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
}
