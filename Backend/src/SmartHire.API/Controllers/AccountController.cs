using MediatR;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Account.GetCurrentAccount;

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
}