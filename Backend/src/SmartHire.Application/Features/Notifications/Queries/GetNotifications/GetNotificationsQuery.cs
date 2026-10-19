using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Notifications.DTOs;
using SmartHire.Application.Features.Notifications.Exceptions;
using SmartHire.Application.Features.Notifications.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Notifications.Queries.GetNotifications;

public sealed record GetNotificationsQuery(
    NotificationType? Type,
    bool? IsUnread,
    int Page = 1,
    int PageSize = 20
) : IRequest<(IReadOnlyList<NotificationDto> Items, int TotalCount)>;

public sealed class GetNotificationsQueryHandler
    : IRequestHandler<GetNotificationsQuery, (IReadOnlyList<NotificationDto> Items, int TotalCount)> {
    private readonly ICurrentUser _currentUser;
    private readonly INotificationRepository _notificationRepository;

    public GetNotificationsQueryHandler(
        ICurrentUser currentUser,
        INotificationRepository notificationRepository) {
        _currentUser = currentUser;
        _notificationRepository = notificationRepository;
    }

    public async Task<(IReadOnlyList<NotificationDto> Items, int TotalCount)> Handle(
        GetNotificationsQuery request,
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw NotificationExceptions.InvalidAccessToken();
        }

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize switch {
            < 1 => 20,
            > 100 => 100,
            _ => request.PageSize
        };

        var (items, totalCount) = await _notificationRepository.GetByRecipientPagedAsync(
            userId,
            request.Type,
            request.IsUnread,
            page,
            pageSize,
            cancellationToken);

        var dtos = items.Select(NotificationResultMapper.ToDto).ToList();

        return (dtos, totalCount);
    }
}
