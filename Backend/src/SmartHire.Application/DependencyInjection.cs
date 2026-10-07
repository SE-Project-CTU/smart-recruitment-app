using Microsoft.Extensions.DependencyInjection;

using SmartHire.Application.Features.Auth.RegisterAccount;

namespace SmartHire.Application;

public static class DependencyInjection {
    public static IServiceCollection AddApplication(
        this IServiceCollection services
    ) {
        services.AddScoped<RegisterAccountWorkflow>();

        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly)
        );
        
        return services;
    }
}
