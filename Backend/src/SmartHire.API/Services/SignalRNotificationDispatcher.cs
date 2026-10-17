using Microsoft.AspNetCore.SignalR;
using SmartHire.Api.Hubs;
using SmartHire.Application.Abstractions.Notifications;

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
}
