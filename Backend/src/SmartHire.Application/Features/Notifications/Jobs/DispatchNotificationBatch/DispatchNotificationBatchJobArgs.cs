namespace SmartHire.Application.Features.Notifications.Jobs.DispatchNotificationBatch;

/// <summary>
/// Notification IDs whose realtime events should be dispatched by a background worker.
/// Keep each batch bounded to avoid large Hangfire job payloads.
/// </summary>
public sealed record DispatchNotificationBatchJobArgs(Guid[] NotificationIds);
