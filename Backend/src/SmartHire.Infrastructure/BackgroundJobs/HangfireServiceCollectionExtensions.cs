using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartHire.Application.Abstractions.BackgroundJobs;

namespace SmartHire.Infrastructure.BackgroundJobs;

public static class HangfireServiceCollectionExtensions {
    public static IServiceCollection AddHangfireBackgroundJobs(
        this IServiceCollection services,
        IConfiguration configuration) {
        var connectionString = configuration.GetConnectionString("HangfireConnection")
                               ?? throw new InvalidOperationException(
                                   "Connection string 'HangfireConnection' was not configured.");
        
        services.AddHangfire(hangfire =>
            hangfire.UsePostgreSqlStorage(options =>
                    options.UseNpgsqlConnection(connectionString))
                .UseFilter(new AutomaticRetryAttribute {
                    Attempts = 3,
                    DelaysInSeconds = [30, 120, 600]
                })
        );
        
        services.AddHangfireServer(options => { options.WorkerCount = 2; });
        services.AddScoped<IBackgroundJobScheduler, HangfireBackgroundJobScheduler>();
        
        return services;
    }
}