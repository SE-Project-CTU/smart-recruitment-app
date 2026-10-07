using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Contracts.Requests;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Account.GetCurrentAccount;
using SmartHire.Application.Features.Account.ChangePassword;
using SmartHire.Application.Features.Account.UpdateCurrentAccount;

namespace SmartHire.Api.Controllers;

[ApiController]
[Authorize(Roles =
    RoleNames.Candidate + "," +
    RoleNames.Recruiter + "," +
    RoleNames.Admin)
]
[Route("api/v1/[controller]")]
public sealed class AccountController : ControllerBase {
    private readonly ISender _sender;
    private readonly ApiResponseFactory _responseFactory;
    
    public AccountController(ISender sender, ApiResponseFactory responseFactory) {
        _sender = sender;
        _responseFactory = responseFactory;
    }
    
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentAccount(
        CancellationToken cancellationToken
    ) {
        var result = await _sender.Send(
            new GetCurrentAccountQuery(),
            cancellationToken
        );
        
        return Ok(_responseFactory.Success(result));
    }
    
    [HttpPatch("me")]
    public async Task<IActionResult> UpdateCurrentAccount(
        [FromBody] UpdateCurrentAccountRequest? request,
        CancellationToken cancellationToken) {
        if (request is null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.");
        }
        
        if (request.AdditionalFields is { Count: > 0 }) {
            var details = request.AdditionalFields.Keys
                .Select(fieldName => new AppErrorDetail(
                    fieldName,
                    ValidationReasons.NotAllowed,
                    $"Field '{fieldName}' cannot be updated through this endpoint."))
                .ToArray();
            
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "Request contains fields that are not allowed.",
                details);
        }
        
        var command = new UpdateCurrentAccountCommand(
            request.FullNameProvided,
            request.FullName,
            request.PhoneProvided,
            request.Phone,
            request.AvatarFileIdProvided,
            request.AvatarFileId);
        
        var result = await _sender.Send(command, cancellationToken);
        
        return Ok(_responseFactory.Success(result));
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest? request,
        CancellationToken cancellationToken)
    {
        if (request is null)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidRequestBody,
                "Request body is required.");
        }

        await _sender.Send(
            new ChangePasswordCommand(
                request.CurrentPassword,
                request.NewPassword,
                request.RevokeAllSessions),
            cancellationToken);

        return NoContent();
    }
}
