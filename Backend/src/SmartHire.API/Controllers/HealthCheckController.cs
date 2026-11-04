using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;

namespace SmartHire.Api.Controllers;

[ApiController]
[Route("api/v1/health")]
public sealed class HealthCheckController(
    ApiResponseFactory responseFactory
) : ControllerBase {
    /// <summary>
    /// Returns the availability status of the API.
    /// </summary>
    [AllowAnonymous]
    [HttpGet]
    public IActionResult Get() {
        return Ok(responseFactory.Success(
            new {
                status = "healthy",
                service = "SmartHire API",
                timestamp = DateTimeOffset.UtcNow
            }
        ));
    }
}