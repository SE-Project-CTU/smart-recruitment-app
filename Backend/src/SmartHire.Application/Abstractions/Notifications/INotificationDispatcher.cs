namespace SmartHire.Application.Abstractions.Notifications;

public interface INotificationDispatcher {
    Task DispatchAsync(Guid recipientId, object notificationDto, CancellationToken cancellationToken = default);
    Task DispatchToGroupAsync(string groupName, string eventName, object payload, CancellationToken cancellationToken = default);
    Task DispatchToCompanyAsync(Guid companyId, object notificationDto, CancellationToken cancellationToken = default);
    Task DispatchToRoleAsync(string roleName, object notificationDto, CancellationToken cancellationToken = default);
    Task DispatchBroadcastAsync(object notificationDto, CancellationToken cancellationToken = default);
}
