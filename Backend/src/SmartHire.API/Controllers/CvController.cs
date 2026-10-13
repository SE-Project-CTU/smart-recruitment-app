using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Cv.Commands.CreateCv;
using SmartHire.Application.Features.Cv.Commands.DeleteCv;
using SmartHire.Application.Features.Cv.Commands.UpdateCv;
using SmartHire.Application.Features.Cv.Queries.GetCvDetail;
using SmartHire.Application.Features.Cv.Queries.GetMyCvs;

namespace SmartHire.Api.Controllers;

[ApiController]
[Authorize(Roles = RoleNames.Candidate)]
[Route("api/v1/cvs")]
public sealed class CvController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;
    
    public CvController(ISender sender, ApiResponseFactory factory) {
        _sender = sender;
        _responseFactory = factory;
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateNewCv(
        [FromBody] CreateCvRequest request,
        CancellationToken cancellationToken
    ) {
        var result = await _sender.Send(new CreateCvCommand(
            request.TemplateId,
            request.Title,
            request.Language
        ), cancellationToken);
        
        return StatusCode(StatusCodes.Status201Created, result);
    }
    
    [HttpGet]
    public async Task<IActionResult> GetMyCvs(
        [FromQuery] int page = 0,
        [FromQuery] int pageSize = 20,
        [FromQuery] bool? isPublic = null,
        [FromQuery] string? language = null,
        CancellationToken cancellationToken = default
    ) {
        var result = await _sender.Send(
            new GetMyCvsQuery(page, pageSize, isPublic, language),
            cancellationToken);
        
        return Ok(_responseFactory.Paged(
            result.Items,
            result.Page,
            result.PageSize,
            result.TotalItems
        ));
    }
    
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCvDetail(
        Guid id,
        CancellationToken cancellationToken
    ) {
        var result = await _sender.Send(
            new GetCvDetailQuery(id),
            cancellationToken);
        
        return Ok(_responseFactory.Success(result));
    }
    
    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateCv(
        Guid id,
        [FromBody] UpdateCvRequest request,
        CancellationToken cancellationToken
    ) {
        var command = new UpdateCvCommand(
            id,
            request.TitleProvided,
            request.Title,
            request.ContentProvided,
            request.Content,
            request.LayoutProvided,
            request.Layout,
            request.PresentationProvided,
            request.Presentation,
            request.LanguageProvided,
            request.Language,
            request.IsPublic,
            request.IsPublicProvided,
            request.AdditionalFields?.Keys.ToArray() ?? Array.Empty<string>()
        );
        
        var result = await _sender.Send(command, cancellationToken);
        return Ok(_responseFactory.Success(result));
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCv(
        Guid id,
        CancellationToken cancellationToken
    ) {
        await _sender.Send(new DeleteCvCommand(id), cancellationToken);
        return NoContent();
    }
}