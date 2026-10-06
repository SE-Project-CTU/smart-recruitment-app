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
    
    /// <summary>
    /// Returns a sample success response with the request's correlation ID.
    /// </summary>
    [HttpGet("success")]
    public IActionResult Success() {
        var correlationId = HttpContext.Items[CorrelationIdMiddleware.ItemKey]?.ToString();
        
        return Ok(ApiResponseFactory.Success(
            data: new {
                message = "The success endpoint is working."
            },
            correlationId
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
    [HttpGet("pagination")]
    public IActionResult SuccessWithPagination() {
        var correlationId = HttpContext.Items[CorrelationIdMiddleware.ItemKey]?.ToString();
        
        return Ok(ApiResponseFactory.Paged(
            new[] {
                new {
                    message = "The success endpoint is working."
                }
            },
            0,
            10,
            20,
            correlationId
        ));
    }
}

public sealed record TestExceptionData(string Hint);