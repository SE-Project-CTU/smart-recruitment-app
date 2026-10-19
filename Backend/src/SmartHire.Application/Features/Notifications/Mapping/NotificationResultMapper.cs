using SmartHire.Application.Features.Notifications.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Notifications.Mapping;

public static class NotificationResultMapper {
    public static NotificationDto ToDto(Notification notification) {
        ArgumentNullException.ThrowIfNull(notification);

        return new NotificationDto(
            notification.Id,
            notification.RecipientId,
            notification.Type.ToString(),
            notification.Title,
            notification.Body,
            notification.Payload,
            notification.ResourceType,
            notification.ResourceId,
            notification.CreatedAt,
            notification.ReadAt,
            notification.ExpiresAt,
            notification.ReadAt.HasValue);
    }
}
