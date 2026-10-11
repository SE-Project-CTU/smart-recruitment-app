using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Api.Middleware;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1/exception-test")]
public sealed class ResponseTestController : ControllerBase {
    private const string TestExceptionCode = "TEST_EXCEPTION";
    private readonly ApiResponseFactory _responseFactory;
    
    public ResponseTestController(ApiResponseFactory responseFactory) {
        _responseFactory = responseFactory;
    }
    
    /// <summary>
    /// Returns a sample success response with the request's correlation ID.
    /// </summary>
    [HttpGet("success")]
    public IActionResult Success() {
        return Ok(_responseFactory.Success(
            data: new {
                message = "The success endpoint is working."
            }
        ));
    }
    
    /// <summary>
    /// Throws a deliberate conflict exception with sample data to exercise error handling.
    /// </summary>
    /// <exception cref="AppException{TData}">Always thrown to demonstrate a conflict response.</exception>
    [HttpGet("failure")]
    public IActionResult Failure() {
        throw new AppException<TestExceptionData>(
            AppErrorKind.Conflict,
            TestExceptionCode,
            "This is a deliberate exception for testing.",
            new TestExceptionData("The exception middleware handled this response."));
    }
    
    /// <summary>
    /// Returns a sample first page with pagination metadata and the request's correlation ID.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("pagination")]
    public IActionResult SuccessWithPagination() {
        return Ok(_responseFactory.Paged(
            new[] {
                new {
                    message = "The success endpoint is working."
                }
            },
            0,
            10,
            20
        ));
    }
    
    [HttpGet("protected")]
    public IActionResult ProtectedEndpoint() {
        return Ok(_responseFactory.Success(
            data: new {
                message = "The protected endpoint is working."
            }
        ));
    }
}

public sealed record TestExceptionData(string Hint);