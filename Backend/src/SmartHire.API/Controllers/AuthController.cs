using MediatR;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Contracts.Responses;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Auth.Login;
using SmartHire.Application.Features.Auth.Logout;
using SmartHire.Application.Features.Auth.Refresh;
using SmartHire.Application.Features.Auth.RegisterCandidate;
using SmartHire.Application.Features.Auth.RegisterRecruiter;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public sealed class AuthController : ControllerBase {
    private const string RefreshTokenCookieName = "refreshToken";
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;
    
    public AuthController(
        ISender sender,
        ApiResponseFactory responseFactory
    ) {
        _sender = sender;
        _responseFactory = responseFactory;
    }
    
    [AllowAnonymous]
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
    
    [AllowAnonymous]
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
    
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken
    ) {
        var result = await _sender.Send(
            new LoginCommand(request.Email, request.Password),
            cancellationToken
        );
        
        SetRefreshTokenCookie(result.RefreshToken);
        
        var response = new LoginResponse(
            result.AccessToken,
            result.TokenType,
            result.ExpiresIn,
            result.User
        );
        
        return Ok(_responseFactory.Success(response));
    }
    
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshRequest? request,
        CancellationToken cancellationToken
    ) {
        var refreshToken = Request.Cookies[RefreshTokenCookieName] ?? request?.RefreshToken;
        
        var result = await _sender.Send(
            new RefreshCommand(refreshToken),
            cancellationToken
        );
        
        SetRefreshTokenCookie(result.RefreshToken);
        
        var response = new RefreshResponse(
            result.AccessToken,
            result.TokenType,
            result.ExpiresIn
        );
        
        return Ok(_responseFactory.Success(response));
    }
    
    [Authorize(Roles = RoleNames.Candidate + "," + RoleNames.Recruiter + "," + RoleNames.Admin)]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(
        [FromBody] LogoutRequest? request,
        CancellationToken cancellationToken
    ) {
        var refreshToken = Request.Cookies[RefreshTokenCookieName] ?? request?.RefreshToken;
        
        await _sender.Send(
            new LogoutCommand(
                refreshToken,
                request?.AllSessions ?? false),
            cancellationToken
        );
        
        DeleteRefreshTokenCookie();
        
        return NoContent();
    }
    
    private void SetRefreshTokenCookie(string refreshToken) {
        var cookieOptions = new CookieOptions {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/",
            IsEssential = true
        };
        
        Response.Cookies.Append(RefreshTokenCookieName, refreshToken, cookieOptions);
    }
    
    private void DeleteRefreshTokenCookie() {
        var cookieOptions = new CookieOptions {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Path = "/"
        };
        
        Response.Cookies.Delete(RefreshTokenCookieName, cookieOptions);
    }
}
