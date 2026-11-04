using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests.Admin;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Rbac.Commands.AssignRolePermissions;
using SmartHire.Application.Features.Admin.Rbac.Commands.CreatePermission;
using SmartHire.Application.Features.Admin.Rbac.Commands.UpdatePermission;
using SmartHire.Application.Features.Admin.Rbac.Queries.GetRolePermissions;
using SmartHire.Application.Features.Admin.Rbac.Queries.ListPermissions;

namespace SmartHire.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin")]
public sealed class AdminRbacController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public AdminRbacController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    /// <summary>
    /// Tra cứu và lọc danh mục quyền hạn
    /// </summary>
    [HttpGet("permissions")]
    public async Task<IActionResult> GetPermissions(
        [FromQuery] string? search,
        [FromQuery] string? module,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListPermissionsQuery(
            Search: search,
            Module: module,
            IsActive: isActive,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    /// <summary>
    /// Thêm quyền hạn mới vào hệ thống
    /// </summary>
    [HttpPost("permissions")]
    public async Task<IActionResult> CreatePermission(
        [FromBody] CreatePermissionRequest request,
        CancellationToken cancellationToken = default) {
        var command = new CreatePermissionCommand(
            Code: request.Code,
            Name: request.Name,
            Description: request.Description,
            Module: request.Module
        );

        var result = await _sender.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    /// <summary>
    /// Cập nhật thông tin quyền hạn hoặc thay đổi trạng thái kích hoạt (Soft Hide)
    /// </summary>
    [HttpPatch("permissions/{id:guid}")]
    public async Task<IActionResult> UpdatePermission(
        [FromRoute] Guid id,
        [FromBody] UpdatePermissionRequest request,
        CancellationToken cancellationToken = default) {
        var command = new UpdatePermissionCommand(
            Id: id,
            Name: request.Name,
            Description: request.Description,
            Module: request.Module,
            IsActive: request.IsActive
        );

        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Lấy danh sách quyền hạn đã được gán cho một Role
    /// </summary>
    [HttpGet("roles/{id:guid}/permissions")]
    public async Task<IActionResult> GetRolePermissions(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) {
        var query = new GetRolePermissionsQuery(id);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Gán danh sách quyền hạn (Permissions) cho Role
    /// </summary>
    [HttpPut("roles/{id:guid}/permissions")]
    public async Task<IActionResult> AssignRolePermissions(
        [FromRoute] Guid id,
        [FromBody] AssignRolePermissionsRequest request,
        CancellationToken cancellationToken = default) {
        var command = new AssignRolePermissionsCommand(id, request.PermissionIds);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
}

