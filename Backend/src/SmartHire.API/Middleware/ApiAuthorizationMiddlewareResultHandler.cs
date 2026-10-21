using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using SmartHire.Api.Contracts.Errors;
using SmartHire.Application.Common.Errors;

namespace SmartHire.Api.Middleware;

/// <summary>
/// Writes authorization failures using the API's standard error response contract.
/// </summary>
public sealed class ApiAuthorizationMiddlewareResultHandler(
    ILogger<ApiAuthorizationMiddlewareResultHandler> logger
) : IAuthorizationMiddlewareResultHandler {
    private readonly AuthorizationMiddlewareResultHandler _defaultHandler = new();

    public async Task HandleAsync(
        RequestDelegate next,
        HttpContext context,
        AuthorizationPolicy policy,
        PolicyAuthorizationResult authorizeResult) {
        if (!authorizeResult.Forbidden && !authorizeResult.Challenged) {
            await _defaultHandler.HandleAsync(next, context, policy, authorizeResult);
            return;
        }

        // Keep the framework's challenge/forbid behavior (including auth headers),
        // then add the application's JSON error envelope.
        await _defaultHandler.HandleAsync(next, context, policy, authorizeResult);

        if (context.Response.HasStarted) {
            return;
        }

        var isChallenge = authorizeResult.Challenged;
        var statusCode = isChallenge
            ? StatusCodes.Status401Unauthorized
            : StatusCodes.Status403Forbidden;
        var errorCode = isChallenge
            ? CommonErrorCodes.AuthenticationRequired
            : CommonErrorCodes.AccessForbidden;
        var message = isChallenge
            ? "Authentication is required to access this resource."
            : "You do not have permission to access this resource.";

        var correlationId = context.Items[CorrelationIdMiddleware.ItemKey]?.ToString()
                            ?? Guid.NewGuid().ToString("D");

        logger.LogWarning(
            "Authorization failed with HTTP {StatusCode} and error {ErrorCode}. CorrelationId: {CorrelationId}",
            statusCode,
            errorCode,
            correlationId);

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        context.Response.Headers["X-Correlation-ID"] = correlationId;

        var response = new ApiErrorResponse(
            new ApiError(errorCode, message, Array.Empty<AppErrorDetail>()),
            correlationId);

        await context.Response.WriteAsJsonAsync(response, context.RequestAborted);
    }
}
