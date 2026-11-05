using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests.Admin;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Catalogs.Skills.Commands.CreateSkill;
using SmartHire.Application.Features.Admin.Catalogs.Skills.Commands.UpdateSkill;
using SmartHire.Application.Features.Admin.Catalogs.Skills.Queries.ListSkills;

namespace SmartHire.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin/skills")]
public sealed class AdminSkillsController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public AdminSkillsController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    /// <summary>
    /// Tra cứu và lọc danh mục kỹ năng chuẩn hóa
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetSkills(
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListSkillsQuery(
            Search: search,
            IsActive: isActive,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    /// <summary>
    /// Thêm kỹ năng mới vào hệ thống
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateSkill(
        [FromBody] CreateSkillRequest request,
        CancellationToken cancellationToken = default) {
        var command = new CreateSkillCommand(request.Name);
        var result = await _sender.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    /// <summary>
    /// Cập nhật tên hoặc trạng thái kích hoạt kỹ năng (Soft Hide)
    /// </summary>
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateSkill(
        [FromRoute] Guid id,
        [FromBody] UpdateSkillRequest request,
        CancellationToken cancellationToken = default) {
        var command = new UpdateSkillCommand(id, request.Name, request.IsActive);
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
}

