using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using System.Threading.RateLimiting;
using SmartHire.Api.Factories;
using SmartHire.Api.Services;
using SmartHire.Api.Middleware;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Infrastructure.Persistence.Json;

namespace SmartHire.Api;

public static class DependencyInjection {
    public const string PolicyName = "FrontendPolicy";

    public static IServiceCollection AddApiServices(
        this IServiceCollection services,
        IConfiguration? configuration = null)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
                options.JsonSerializerOptions.Converters.Add(new CvLanguageJsonConverter()))
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = ApiModelStateResponseFactory.Create;
            });

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, HttpCurrentUser>();
        services.AddSingleton<IAuthorizationMiddlewareResultHandler, ApiAuthorizationMiddlewareResultHandler>();

        // SignalR với Redis Backplane (Graceful fallback về In-Memory nếu Redis không khả dụng)
        var signalRBuilder = services.AddSignalR();
        var redisConnStr = configuration?["Redis:ConnectionString"];
        var redisHost = configuration?["REDIS_HOST"] ?? configuration?["Redis:Host"];
        var redisPort = configuration?["REDIS_PORT"] ?? configuration?["Redis:Port"] ?? "6379";
        var redisPassword = configuration?["REDIS_PASSWORD"] ?? configuration?["Redis:Password"];

        string? redisConfig = null;
        if (!string.IsNullOrWhiteSpace(redisConnStr)) {
            redisConfig = redisConnStr;
        } else if (!string.IsNullOrWhiteSpace(redisHost)) {
            redisConfig = $"{redisHost}:{redisPort},abortConnect=false";
            if (!string.IsNullOrWhiteSpace(redisPassword)) {
                redisConfig += $",password={redisPassword}";
            }
        }

        if (!string.IsNullOrWhiteSpace(redisConfig)) {
            signalRBuilder.AddStackExchangeRedis(redisConfig, options => {
                options.Configuration.ChannelPrefix = StackExchange.Redis.RedisChannel.Literal("SmartHire_SignalR");
            });
        }

        services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, Hubs.SubUserIdProvider>();
        services.AddScoped<SmartHire.Application.Abstractions.Notifications.INotificationDispatcher, Services.SignalRNotificationDispatcher>();
        
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
                policy.SetIsOriginAllowed(origin => {
                    if (string.IsNullOrEmpty(origin) || origin == "null") return true;
                    if (Uri.TryCreate(origin, UriKind.Absolute, out var uri)) {
                        if (uri.Host == "localhost" || uri.Host == "127.0.0.1") return true;
                    }
                    return allowedOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase);
                })
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            });
        });
        return services;
    }

    public static IServiceCollection AddAppRateLimiter(this IServiceCollection services) {
        services.AddRateLimiter(options => {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.AddPolicy("media-upload", httpContext => {
                var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                             ?? httpContext.User.FindFirst("sub")?.Value
                             ?? httpContext.Connection.RemoteIpAddress?.ToString()
                             ?? "anonymous";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: userId,
                    factory: _ => new FixedWindowRateLimiterOptions {
                        PermitLimit = 20,
                        Window = TimeSpan.FromHours(1),
                        QueueLimit = 0
                    });
            });

            options.AddPolicy("ai-assistant", httpContext => {
                var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                             ?? httpContext.User.FindFirst("sub")?.Value
                             ?? httpContext.Connection.RemoteIpAddress?.ToString()
                             ?? "anonymous";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: userId,
                    factory: _ => new FixedWindowRateLimiterOptions {
                        PermitLimit = 30,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    });
            });
        });

        return services;
    }

}
