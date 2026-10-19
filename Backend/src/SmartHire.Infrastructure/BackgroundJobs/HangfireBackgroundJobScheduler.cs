using Hangfire;
using SmartHire.Application.Abstractions.BackgroundJobs;

namespace SmartHire.Infrastructure.BackgroundJobs;

internal sealed class HangfireBackgroundJobScheduler : IBackgroundJobScheduler {
    private readonly IBackgroundJobClient _backgroundJobClient;
    private readonly IRecurringJobManager _recurringJobManager;
    
    public HangfireBackgroundJobScheduler(
        IBackgroundJobClient backgroundJobClient,
        IRecurringJobManager recurringJobManager) {
        _backgroundJobClient = backgroundJobClient;
        _recurringJobManager = recurringJobManager;
    }
    
    public string Enqueue<TJob, TArgs>(TArgs args)
        where TJob : IBackgroundJob<TArgs> {
        ArgumentNullException.ThrowIfNull(args);
        return _backgroundJobClient.Enqueue<TJob>(job => job.ExecuteAsync(args, CancellationToken.None));
    }
    
    public string Schedule<TJob, TArgs>(TArgs args, TimeSpan delay)
        where TJob : IBackgroundJob<TArgs> {
        ArgumentNullException.ThrowIfNull(args);
        if (delay < TimeSpan.Zero) {
            throw new ArgumentOutOfRangeException(nameof(delay), "Delay cannot be negative.");
        }
        
        return _backgroundJobClient.Schedule<TJob>(
            job => job.ExecuteAsync(args, CancellationToken.None), delay);
    }
    
    public string Schedule<TJob, TArgs>(TArgs args, DateTimeOffset enqueueAt)
        where TJob : IBackgroundJob<TArgs> {
        ArgumentNullException.ThrowIfNull(args);
        return _backgroundJobClient.Schedule<TJob>(
            job => job.ExecuteAsync(args, CancellationToken.None), enqueueAt);
    }
    
    public void AddOrUpdateRecurring<TJob, TArgs>(
        string recurringJobId,
        TArgs args,
        RecurringSchedule schedule)
        where TJob : IBackgroundJob<TArgs> {
        ArgumentException.ThrowIfNullOrWhiteSpace(recurringJobId);
        ArgumentNullException.ThrowIfNull(args);
        
        var timeZone = TimeZoneInfo.FindSystemTimeZoneById(schedule.TimeZoneId);
        
        _recurringJobManager.AddOrUpdate<TJob>(
            recurringJobId,
            job => job.ExecuteAsync(args, CancellationToken.None),
            ToCronExpression(schedule),
            new RecurringJobOptions {
                TimeZone = timeZone
            }
        );
    }
    
    private static string ToCronExpression(RecurringSchedule schedule) {
        return schedule.Kind switch {
            RecurringScheduleKind.Hourly => Cron.Hourly(),
            
            RecurringScheduleKind.Daily =>
                schedule.TimeOfDay is { } time
                    ? $"{time.Minute} {time.Hour} * * *"
                    : Cron.Daily(),
            
            RecurringScheduleKind.Weekly =>
                schedule.TimeOfDay is { } time
                    ? $"{time.Minute} {time.Hour} * * 1"
                    : Cron.Weekly(),
            
            RecurringScheduleKind.EveryMinutes
                when schedule.Interval is >= 1 and <= 59 =>
                Cron.MinuteInterval(schedule.Interval.Value),
            
            _ => throw new ArgumentOutOfRangeException(
                nameof(schedule),
                "Unsupported or invalid recurring schedule.")
        };
    }
}