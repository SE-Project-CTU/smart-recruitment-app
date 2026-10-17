namespace SmartHire.Application.Abstractions.Notifications;

public interface INotificationDispatcher {
    Task DispatchAsync(Guid recipientId, object notificationDto, CancellationToken cancellationToken = default);
}
