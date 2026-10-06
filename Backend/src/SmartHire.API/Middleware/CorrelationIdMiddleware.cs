using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Api.Middleware;

/// <summary>
/// Validates and propagates correlation IDs for requests under the /api path.
/// </summary>
/// <param name="next">The next delegate in the request pipeline.</param>
public sealed class CorrelationIdMiddleware(RequestDelegate next) {
    public const string ItemKey = "CorrelationId";
    private const string HeaderName = "X-Correlation-ID";
    
    /// <summary>
    /// Validates the API request's correlation header, stores its normalized UUID, and invokes the next delegate.
    /// Requests outside /api pass through without correlation validation.
    /// </summary>
    /// <param name="context">The HTTP context containing the request and response.</param>
    /// <returns>A task representing execution of the remaining request pipeline.</returns>
    /// <exception cref="AppException">An API request has a missing or invalid X-Correlation-ID header.</exception>
    public async Task InvokeAsync(HttpContext context) {
        if (!context.Request.Path.StartsWithSegments("/api")) {
            await next(context);
            return;
        }
        
        var rawValue = context.Request.Headers[HeaderName].ToString();
        
        if (!Guid.TryParse(rawValue, out var correlationId)) {
            var code = string.IsNullOrWhiteSpace(rawValue)
                ? CommonErrorCodes.CorrelationIdRequired
                : CommonErrorCodes.CorrelationIdInvalid;
            
            var message = string.IsNullOrWhiteSpace(rawValue)
                ? "Header X-Correlation-ID is required."
                : "Header X-Correlation-ID must be a valid UUID.";
            
            throw new AppException(
                AppErrorKind.BadRequest,
                code,
                message
            );
        }
        
        var formattedId = correlationId.ToString("D");
        
        context.Items[ItemKey] = formattedId;
        context.Response.Headers[HeaderName] = formattedId;
        
        await next(context);
    }
}
