using Microsoft.Extensions.DependencyInjection;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Features.Auth.RegisterAccount;
using SmartHire.Application.Features.Cv.Jobs.CleanupOrphanedArchivedCvVersions;
using SmartHire.Application.Features.Media.Jobs.DeleteMediaFile;
using SmartHire.Application.Features.Notifications.Jobs.DispatchNotificationBatch;
using SmartHire.Application.Features.JobPostings.Jobs.ExpireOverdueJobPostings;

namespace SmartHire.Application;

public static class DependencyInjection {
    public static IServiceCollection AddApplication(
        this IServiceCollection services
    ) {
        services.AddScoped<RegisterAccountWorkflow>();
        
        services.AddMediatR(cfg =>
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly)
        );
        
        // Register background jobs
        services.AddBackgroundJob<DeleteMediaFileJob, DeleteMediaFileJobArgs>();
        services.AddBackgroundJob<DispatchNotificationBatchJob, DispatchNotificationBatchJobArgs>();
        services.AddBackgroundJob<ExpireOverdueJobPostingsJob, ExpireOverdueJobPostingsJobArgs>();
        services.AddBackgroundJob<CleanupOrphanedArchivedCvVersionsJob, CleanupOrphanedArchivedCvVersionsJobArgs>();
        
        return services;
    }
}
