using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Api.Middleware;

public sealed class CorrelationIdMiddleware(RequestDelegate next) {
    public const string ItemKey = "CorrelationId";
    private const string HeaderName = "X-Correlation-ID";
    
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
