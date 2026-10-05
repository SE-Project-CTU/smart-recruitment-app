using Microsoft.AspNetCore.Diagnostics;
using SmartHire.Api.Contracts.Errors;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Api.Middleware;

public sealed class ApiExceptionHandler(
    ILogger<ApiExceptionHandler> logger
) : IExceptionHandler {
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken cancellationToken
    ) {
        if (context.Response.HasStarted) return false;
        
        var correlationId =
            context.Items[CorrelationIdMiddleware.ItemKey]?.ToString()
            ?? Guid.NewGuid().ToString("D");
        
        var (statusCode, error) = exception switch {
            AppExceptionBase appException => (
                GetStatusCode(appException.Kind),
                new ApiError(
                    appException.Code,
                    appException.Message,
                    appException.Details,
                    appException.ErrorData)
            ),
            
            _ => (
                StatusCodes.Status500InternalServerError,
                new ApiError(
                    CommonErrorCodes.InternalServerError,
                    "Internal errors occur",
                    Array.Empty<AppErrorDetail>())
            )
        };
        
        if (statusCode >= 500) {
            logger.LogError(exception, "Unhandled error. CorrelationId: {CorrelationId}", correlationId);
        }
        else {
            logger.LogWarning(
                "Request failed with {ErrorCode}. CorrelationId: {CorrelationId}",
                error.Code,
                correlationId
            );
        }
        
        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        context.Response.Headers["X-Correlation-ID"] = correlationId;
        
        var response = new ApiErrorResponse(error, correlationId);
        
        await context.Response.WriteAsJsonAsync(response, cancellationToken);
        
        return true;
    }
    
    public static int GetStatusCode(AppErrorKind kind) {
        return kind switch {
            AppErrorKind.BadRequest => StatusCodes.Status400BadRequest,
            AppErrorKind.Validation => StatusCodes.Status422UnprocessableEntity,
            AppErrorKind.Unauthorized => StatusCodes.Status401Unauthorized,
            AppErrorKind.Forbidden => StatusCodes.Status403Forbidden,
            AppErrorKind.NotFound => StatusCodes.Status404NotFound,
            AppErrorKind.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status500InternalServerError
        };
    }
}
