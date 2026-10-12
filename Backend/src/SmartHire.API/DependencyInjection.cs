using Microsoft.AspNetCore.Mvc;
using SmartHire.Api.Factories;
using SmartHire.Api.Services;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Infrastructure.Persistence.Json;

namespace SmartHire.Api;

public static class DependencyInjection {
    public static IServiceCollection AddApiServices(this IServiceCollection services) {
        services.AddControllers()
            .AddJsonOptions(options =>
                options.JsonSerializerOptions.Converters.Add(new CvLanguageJsonConverter()))
            .ConfigureApiBehaviorOptions(options => {
                options.InvalidModelStateResponseFactory = ApiModelStateResponseFactory.Create;
            });
        
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, HttpCurrentUser>();
        
        return services;
    }
}
