using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Notifications.Mapping;

namespace SmartHire.Application.Features.Notifications.Jobs.DispatchNotificationBatch;

/// <summary>
/// Loads persisted notifications and sends their realtime SignalR events.
/// </summary>
public sealed class DispatchNotificationBatchJob(
    INotificationRepository notificationRepository,
    INotificationDispatcher notificationDispatcher,
    ILogger<DispatchNotificationBatchJob> logger
) : IBackgroundJob<DispatchNotificationBatchJobArgs> {
    public async Task ExecuteAsync(
        DispatchNotificationBatchJobArgs args,
        CancellationToken cancellationToken) {
        ArgumentNullException.ThrowIfNull(args);
        ArgumentNullException.ThrowIfNull(args.NotificationIds);

        if (args.NotificationIds.Length == 0) {
            return;
        }

        var notifications = await notificationRepository.GetByIdsAsync(
            args.NotificationIds,
            cancellationToken);
        var now = DateTimeOffset.UtcNow;

        foreach (var notification in notifications) {
            if (notification.ExpiresAt is DateTimeOffset expiresAt && expiresAt <= now) {
                logger.LogInformation(
                    "Skipping realtime dispatch for expired notification {NotificationId}.",
                    notification.Id);
                continue;
            }

            await notificationDispatcher.DispatchAsync(
                notification.RecipientId,
                NotificationResultMapper.ToDto(notification),
                cancellationToken);
        }
    }
}
