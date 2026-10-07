using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Api.Middleware;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Auth.Login;
using SmartHire.Application.Features.Auth.RegisterCandidate;
using SmartHire.Application.Features.Auth.RegisterRecruiter;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
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
        [FromBody] RegisterCandidateRequest? request,
        CancellationToken cancellationToken
    ) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required."
            );
        }
        
        var command = new RegisterCandidateCommand(
            request.Email ?? string.Empty,
            request.Phone,
            request.Password ?? string.Empty,
            request.FullName ?? string.Empty
        );
        
        var result = await _sender.Send(command, cancellationToken);
        
        var response = _responseFactory.Success(
            result
        );
        
        return StatusCode(StatusCodes.Status201Created, response);
    }
    
    [HttpPost("register/recruiter")]
    public async Task<IActionResult> RegisterRecruiter(
        [FromBody] RegisterRecruiterRequest? request,
        CancellationToken cancellationToken
    ) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required."
            );
        }
        
        var command = new RegisterRecruiterCommand(
            request.Email ?? string.Empty,
            request.Phone,
            request.Password ?? string.Empty,
            request.FullName ?? string.Empty
        );
        
        var result = await _sender.Send(command, cancellationToken);
        var response = _responseFactory.Success(result);
        
        return StatusCode(StatusCodes.Status201Created, response);
    }
    
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken
    ) {
        var result = await _sender.Send(
            new LoginCommand(request.Email, request.Password),
            cancellationToken
        );
        
        return Ok(_responseFactory.Success(result));
    }
}