using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Api.Middleware;
using SmartHire.Application.Features.Auth.RegisterCandidate;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;
    
    public AuthController(
        ISender sender,
        ApiResponseFactory responseFactory
    ) {
        _sender = sender;
        _responseFactory = responseFactory;
    }
    
    [HttpPost("register")]
    public async Task<IActionResult> RegisterCandidate(
        [FromBody] RegisterCandidateRequest request,
        CancellationToken cancellationToken
    ) {
        var command = new RegisterCandidateCommand(
            request.Email,
            request.Phone,
            request.Password,
            request.FullName
        );
        
        var result = await _sender.Send(command, cancellationToken);
        
        var response = _responseFactory.Success(
            result
        );
        
        return StatusCode(StatusCodes.Status201Created, response);
    }
}