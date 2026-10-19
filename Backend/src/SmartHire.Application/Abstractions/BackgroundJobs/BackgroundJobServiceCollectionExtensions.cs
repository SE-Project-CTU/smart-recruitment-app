using Microsoft.Extensions.DependencyInjection;

namespace SmartHire.Application.Abstractions.BackgroundJobs;

public static class BackgroundJobServiceCollectionExtensions
{
    /// <summary>
    /// Registers a job so the configured job processor can resolve it through DI.
    /// Call once for each concrete job in the feature's composition setup.
    /// </summary>
    public static IServiceCollection AddBackgroundJob<TJob, TArgs>(this IServiceCollection services)
        where TJob : class, IBackgroundJob<TArgs>
    {
        services.AddScoped<TJob>();
        return services;
    }
}
