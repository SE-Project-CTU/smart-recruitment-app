using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using SmartHire.Api.Contracts.Errors;
using SmartHire.Api.Middleware;
using SmartHire.Api.Services;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;

namespace SmartHire.Api;

public static class DependencyInjection {
    public const string PolicyName = "FrontendPolicy";
    
    public static IServiceCollection AddApiServices(this IServiceCollection services) {
        services.AddControllers()
            .ConfigureApiBehaviorOptions(options => {
                options.InvalidModelStateResponseFactory = actionContext => {
                    var hasBodyParsingError = actionContext.ModelState.Values
                        .SelectMany(value => value.Errors)
                        .Any(error => error.Exception is JsonException or InputFormatterException);
                    
                    var correlationId =
                        actionContext.HttpContext.Items[CorrelationIdMiddleware.ItemKey]?.ToString()
                        ?? Guid.NewGuid().ToString("D");
                    
                    var error = new ApiError(
                        CommonErrorCodes.InvalidRequestBody,
                        hasBodyParsingError
                            ? "Request body is missing or contains invalid JSON."
                            : "Request body is invalid.",
                        Array.Empty<AppErrorDetail>());
                    
                    var statusCode = hasBodyParsingError
                        ? StatusCodes.Status400BadRequest
                        : StatusCodes.Status422UnprocessableEntity;
                    
                    return new ObjectResult(new ApiErrorResponse(error, correlationId)) {
                        StatusCode = statusCode
                    };
                };
            });
        
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, HttpCurrentUser>();
        
        return services;
    }
    
    public static IServiceCollection AddAppCors(
        this IServiceCollection services,
        IConfiguration configuration) {
        var originsValue = configuration["Cors:AllowedOrigins"];
        
        var allowedOrigins = originsValue?
                                 .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                             ?? Array.Empty<string>();
        
        services.AddCors(options => {
            options.AddPolicy(PolicyName, policy => {
                if (allowedOrigins.Length > 0) {
                    policy.WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                }
                else {
                    policy.SetIsOriginAllowed(_ => true)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                }
            });
        });
        return services;
    }
}