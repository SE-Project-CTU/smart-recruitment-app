using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.CvTemplate.Queries.Queries.GetAllCvTemplates;
using SmartHire.Application.Features.CvTemplate.Queries.Queries.GetCvTemplateById;

namespace SmartHire.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/v1/cv-templates")]
public sealed class CvTemplatesController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;
    
    public CvTemplatesController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetActive(
        [FromQuery] int page = PagedListQueryValidator.FirstPage,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        CancellationToken cancellationToken = default) {
        var result = await _sender.Send(
            new GetAllCvTemplatesQuery(page, pageSize, search),
            cancellationToken);
        
        return Ok(_responseFactory.PagedOneBased(
            result.Items,
            result.Page,
            result.PageSize,
            result.TotalItems));
    }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken) {
        var result = await _sender.Send(
            new GetCvTemplateByIdQuery(id),
            cancellationToken);
        
        return Ok(_responseFactory.Success(result));
    }
}
