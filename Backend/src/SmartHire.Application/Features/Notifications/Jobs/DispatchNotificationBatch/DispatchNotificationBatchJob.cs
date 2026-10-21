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

        var notifications = await notificationRepository.GetPendingRealtimeDispatchByIdsAsync(
            args.NotificationIds,
            cancellationToken);
        var now = DateTimeOffset.UtcNow;
        var successfullyDispatchedIds = new HashSet<Guid>();

        try {
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

                successfullyDispatchedIds.Add(notification.Id);
            }
        }
        catch {
            // Persist completed sends before allowing Hangfire to retry the failed batch.
            // Ignore only a marker-write failure here so the original dispatch exception is retried.
            await PersistDispatchedIdsAsync(successfullyDispatchedIds, suppressFailure: true);
            throw;
        }

        // A marker-write failure on the success path must fail the Hangfire job so it can retry.
        await PersistDispatchedIdsAsync(successfullyDispatchedIds, suppressFailure: false);
    }

    private async Task PersistDispatchedIdsAsync(
        HashSet<Guid> successfullyDispatchedIds,
        bool suppressFailure) {
        if (successfullyDispatchedIds.Count == 0) {
            return;
        }

        try {
            var markedCount = await notificationRepository.MarkRealtimeDispatchedAsync(
                successfullyDispatchedIds,
                DateTimeOffset.UtcNow,
                CancellationToken.None);

            if (markedCount != successfullyDispatchedIds.Count) {
                logger.LogWarning(
                    "Marked {MarkedCount} of {DispatchedCount} notifications as realtime-dispatched.",
                    markedCount,
                    successfullyDispatchedIds.Count);
            }
        }
        catch (Exception exception) when (suppressFailure) {
            logger.LogError(
                exception,
                "Could not persist realtime-dispatched markers for {NotificationCount} notifications.",
                successfullyDispatchedIds.Count);
        }
    }
}
