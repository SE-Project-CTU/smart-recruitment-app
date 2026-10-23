using SmartHire.Application.Features.Notifications.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Notifications.Mapping;

public static class NotificationResultMapper {
    public static NotificationDto ToDto(Notification notification) =>
        NotificationDtoMapper.ToDto(notification);

    public static UnreadCountResult ToUnreadCountResult(int count) =>
        UnreadCountResultMapper.ToResult(count);
}
