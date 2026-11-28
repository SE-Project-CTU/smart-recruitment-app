using Microsoft.AspNetCore.SignalR;
using SmartHire.Api.Hubs;
using SmartHire.Application.Abstractions.Notifications;
using SmartHire.Application.Features.Notifications.Constants;

namespace SmartHire.Api.Services;

public class SignalRNotificationDispatcher : INotificationDispatcher {
    private readonly IHubContext<NotificationHub> _hubContext;
            
    public SignalRNotificationDispatcher(IHubContext<NotificationHub> hubContext) {
        _hubContext = hubContext;
    }

    public async Task DispatchAsync(Guid recipientId, object notificationDto, CancellationToken cancellationToken = default) {
        var recipientUserKey = recipientId.ToString();
        await _hubContext.Clients.User(recipientUserKey)
            .SendAsync("ReceiveNotification", notificationDto, cancellationToken);
    }

    public async Task DispatchToGroupAsync(string groupName, string eventName, object payload, CancellationToken cancellationToken = default) {
        if (string.IsNullOrWhiteSpace(groupName) || string.IsNullOrWhiteSpace(eventName)) return;
        await _hubContext.Clients.Group(groupName)
            .SendAsync(eventName, payload, cancellationToken);
    }

    public async Task DispatchToCompanyAsync(Guid companyId, object notificationDto, CancellationToken cancellationToken = default) {
        if (companyId == Guid.Empty) return;
        var group = NotificationGroups.Company(companyId);
        await _hubContext.Clients.Group(group)
            .SendAsync("ReceiveNotification", notificationDto, cancellationToken);
    }

    public async Task DispatchToRoleAsync(string roleName, object notificationDto, CancellationToken cancellationToken = default) {
        if (string.IsNullOrWhiteSpace(roleName)) return;
        var group = NotificationGroups.Role(roleName);
        await _hubContext.Clients.Group(group)
            .SendAsync("ReceiveNotification", notificationDto, cancellationToken);
    }

    public async Task DispatchBroadcastAsync(object notificationDto, CancellationToken cancellationToken = default) {
        await _hubContext.Clients.Group(NotificationGroups.SystemAll)
            .SendAsync("ReceiveNotification", notificationDto, cancellationToken);
    }
}
