using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Notifications.Exceptions;

namespace SmartHire.Application.Features.Notifications.Commands.MarkAllRead;

public sealed record MarkAllNotificationsReadCommand : IRequest;

public sealed class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand> {
    private readonly ICurrentUser _currentUser;
    private readonly INotificationRepository _notificationRepository;

    public MarkAllNotificationsReadCommandHandler(
        ICurrentUser currentUser,
        INotificationRepository notificationRepository) {
        _currentUser = currentUser;
        _notificationRepository = notificationRepository;
    }

    public async Task Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw NotificationExceptions.InvalidAccessToken();
        }

        await _notificationRepository.MarkAllAsReadAsync(userId, DateTimeOffset.UtcNow, cancellationToken);
    }
}
