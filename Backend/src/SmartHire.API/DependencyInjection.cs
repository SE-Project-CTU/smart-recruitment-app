using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Api.Services;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Infrastructure.Persistence.Json;

namespace SmartHire.Api;

public static class DependencyInjection {
    public const string PolicyName = "FrontendPolicy";

    public static IServiceCollection AddApiServices(this IServiceCollection services)
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

        // SignalR
        services.AddSignalR();
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
