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
    
    [HttpGet("failure")]
    public IActionResult Failure() {
        throw new AppException<TestExceptionData>(
            AppErrorKind.Conflict,
            TestExceptionCode,
            "This is a deliberate exception for testing.",
            new TestExceptionData("The exception middleware handled this response."));
    }
    
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