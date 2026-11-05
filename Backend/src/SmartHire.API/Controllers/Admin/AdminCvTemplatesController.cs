using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests.Admin;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Commands.CreateCvTemplate;
using SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Commands.UpdateCvTemplate;
using SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Queries.GetCvTemplateDetail;
using SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Queries.ListCvTemplates;
using SmartHire.Domain.Enums;

namespace SmartHire.Api.Controllers.Admin;

[ApiController]
[Authorize(Roles = RoleNames.Admin)]
[Route("api/v1/admin/cv-templates")]
public sealed class AdminCvTemplatesController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;

    public AdminCvTemplatesController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }

    /// <summary>
    /// Danh sách mẫu CV tiêu chuẩn
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetCvTemplates(
        [FromQuery] string? search,
        [FromQuery] bool? isActive,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default) {
        var query = new ListCvTemplatesQuery(
            Search: search,
            IsActive: isActive,
            Pagination: new PaginationParams(page, pageSize)
        );

        var (items, totalCount) = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.PagedOneBased(items, page, pageSize, totalCount));
    }

    /// <summary>
    /// Xem chi tiết mẫu CV kèm cấu trúc Layout và Content
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCvTemplateDetail(
        [FromRoute] Guid id,
        CancellationToken cancellationToken = default) {
        var query = new GetCvTemplateDetailQuery(id);
        var result = await _sender.Send(query, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }

    /// <summary>
    /// Tạo mới mẫu CV tiêu chuẩn
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateCvTemplate(
        [FromBody] CreateCvTemplateRequest request,
        CancellationToken cancellationToken = default) {
        var lang = CvLanguage.Vietnamese;
        if (!string.IsNullOrWhiteSpace(request.Language)) {
            if (string.Equals(request.Language, "en", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(request.Language, "english", StringComparison.OrdinalIgnoreCase)) {
                lang = CvLanguage.English;
            }
        }

        var command = new CreateCvTemplateCommand(
            Code: request.Code,
            Name: request.Name,
            Description: request.Description,
            ThumbnailFileId: request.ThumbnailFileId,
            Version: request.Version,
            DefaultLayout: request.DefaultLayout,
            DefaultContent: request.DefaultContent,
            Language: lang
        );

        var result = await _sender.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, _responseFactory.Success(result));
    }

    /// <summary>
    /// Cập nhật thông tin hoặc ẩn/hiện mẫu CV (Soft Hide)
    /// </summary>
    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateCvTemplate(
        [FromRoute] Guid id,
        [FromBody] UpdateCvTemplateRequest request,
        CancellationToken cancellationToken = default) {
        var command = new UpdateCvTemplateCommand(
            Id: id,
            Name: request.Name,
            Description: request.Description,
            ThumbnailFileId: request.ThumbnailFileId,
            Version: request.Version,
            DefaultLayout: request.DefaultLayout,
            DefaultContent: request.DefaultContent,
            IsActive: request.IsActive
        );

        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
}

