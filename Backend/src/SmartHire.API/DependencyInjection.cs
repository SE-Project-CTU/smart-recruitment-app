using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using SmartHire.Api.Contracts.Errors;
using SmartHire.Api.Middleware;
using SmartHire.Api.Services;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Infrastructure.Security;

namespace SmartHire.Api;

public static class DependencyInjection {
    public static IServiceCollection AddApiServices(
        this IServiceCollection services
    ) {
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
        
        return services;
    }
    
    public static IServiceCollection AddJwtBearerAuthentication(
        this IServiceCollection services,
        IConfiguration configuration
    ) {
        var jwt = new JwtOptions();
        configuration.GetSection(JwtOptions.SectionName).Bind(jwt);
        
        var keyBytes = Encoding.UTF8.GetBytes(jwt.SigningKey);
        
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options => {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,
                    
                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,
                    
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
                    
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    
                    NameClaimType = JwtRegisteredClaimNames.Name,
                    RoleClaimType = "role"
                };
            });
        
        services.AddAuthorization();
        
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, HttpCurrentUser>();
        
        return services;
    }
}