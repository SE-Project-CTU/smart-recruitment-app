using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Application.Features.Cv.Commands.CreateCv;

namespace SmartHire.Api.Controllers;

[ApiController]
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
}