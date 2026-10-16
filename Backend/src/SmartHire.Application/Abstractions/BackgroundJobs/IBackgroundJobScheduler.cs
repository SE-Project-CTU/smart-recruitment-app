namespace SmartHire.Application.Abstractions.BackgroundJobs;

/// <summary>
/// Schedules application jobs without exposing a specific job-processing library.
/// </summary>
public interface IBackgroundJobScheduler
{
    string Enqueue<TJob, TArgs>(TArgs args)
        where TJob : IBackgroundJob<TArgs>;

    string Schedule<TJob, TArgs>(TArgs args, TimeSpan delay)
        where TJob : IBackgroundJob<TArgs>;

    string Schedule<TJob, TArgs>(TArgs args, DateTimeOffset enqueueAt)
        where TJob : IBackgroundJob<TArgs>;

    void AddOrUpdateRecurring<TJob, TArgs>(string recurringJobId, TArgs args, RecurringSchedule schedule)
        where TJob : IBackgroundJob<TArgs>;
}
