using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using SmartHire.Application.Abstractions.BackgroundJobs;
using AiCleanupExpiredJob = SmartHire.Application.Features.Ai.Jobs.CleanupExpiredAiConversations.CleanupExpiredAiConversationsJob;
using AiCleanupExpiredJobArgs = SmartHire.Application.Features.Ai.Jobs.CleanupExpiredAiConversations.CleanupExpiredAiConversationsJobArgs;
using SmartHire.Application.Features.Cv.Jobs.CleanupOrphanedArchivedCvVersions;
using SmartHire.Application.Features.JobPostings.Jobs.ExpireOverdueJobPostings;

namespace SmartHire.Infrastructure.BackgroundJobs;

public static class RecurringJobRegistrationExtensions {
    /// <summary>
    /// Đăng ký tất cả các recurring background jobs của hệ thống vào scheduler.
    /// </summary>
    public static IApplicationBuilder UseRecurringBackgroundJobs(this IApplicationBuilder app) {
        using var scope = app.ApplicationServices.CreateScope();
        var scheduler = scope.ServiceProvider.GetRequiredService<IBackgroundJobScheduler>();

        RegisterJobPostingsJobs(scheduler);
        RegisterCvJobs(scheduler);
        RegisterAiJobs(scheduler);

        return app;
    }

    private static void RegisterJobPostingsJobs(IBackgroundJobScheduler scheduler) {
        scheduler.AddOrUpdateRecurring<ExpireOverdueJobPostingsJob, ExpireOverdueJobPostingsJobArgs>(
            "expire-overdue-job-postings",
            new ExpireOverdueJobPostingsJobArgs(),
            new RecurringSchedule(
                RecurringScheduleKind.Daily,
                TimeOfDay: new TimeOnly(0, 5),
                TimeZoneId: "Asia/Ho_Chi_Minh")
        );
    }

    private static void RegisterCvJobs(IBackgroundJobScheduler scheduler) {
        scheduler.AddOrUpdateRecurring<CleanupOrphanedArchivedCvVersionsJob, CleanupOrphanedArchivedCvVersionsJobArgs>(
            "cleanup-orphaned-archived-cv-versions",
            new CleanupOrphanedArchivedCvVersionsJobArgs(RetentionDays: 0),
            new RecurringSchedule(
                RecurringScheduleKind.Daily,
                TimeOfDay: new TimeOnly(0, 5),
                TimeZoneId: "Asia/Ho_Chi_Minh")
        );
    }

    private static void RegisterAiJobs(IBackgroundJobScheduler scheduler) {
        scheduler.AddOrUpdateRecurring<AiCleanupExpiredJob, AiCleanupExpiredJobArgs>(
            "cleanup-expired-ai-conversations",
            new AiCleanupExpiredJobArgs(),
            new RecurringSchedule(
                RecurringScheduleKind.Daily,
                TimeOfDay: new TimeOnly(2, 0),
                TimeZoneId: "Asia/Ho_Chi_Minh")
        );
    }
}
