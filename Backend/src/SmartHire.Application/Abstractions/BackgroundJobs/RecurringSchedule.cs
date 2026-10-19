namespace SmartHire.Application.Abstractions.BackgroundJobs;

public sealed record RecurringSchedule(
    RecurringScheduleKind Kind,
    int? Interval = null,
    TimeOnly? TimeOfDay = null,
    string TimeZoneId = "Asia/Ho_Chi_Minh"
);

public enum RecurringScheduleKind {
    Hourly,
    Daily,
    Weekly,
    EveryMinutes
}