using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Notifications.DTOs;
using SmartHire.Application.Features.Notifications.Exceptions;
using SmartHire.Application.Features.Notifications.Mapping;

namespace SmartHire.Application.Features.Notifications.Queries.GetUnreadCount;

public sealed record GetUnreadCountQuery : IRequest<UnreadCountResult>;

public sealed class GetUnreadCountQueryHandler
    : IRequestHandler<GetUnreadCountQuery, UnreadCountResult> {
    private readonly ICurrentUser _currentUser;
    private readonly INotificationRepository _notificationRepository;

    public GetUnreadCountQueryHandler(
        ICurrentUser currentUser,
        INotificationRepository notificationRepository) {
        _currentUser = currentUser;
        _notificationRepository = notificationRepository;
    }

    public async Task<UnreadCountResult> Handle(
        GetUnreadCountQuery request,
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw NotificationExceptions.InvalidAccessToken();
        }

        var count = await _notificationRepository.GetUnreadCountAsync(userId, cancellationToken);
        return NotificationResultMapper.ToUnreadCountResult(count);
    }
}
