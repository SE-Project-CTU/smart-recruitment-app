using System.Text.Json;
using SmartHire.Application.Features.Notifications.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

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
            ParsePayload(notification.Payload),
            notification.ResourceType,
            notification.ResourceId,
            notification.CreatedAt,
            notification.ReadAt,
            notification.ExpiresAt,
            notification.ReadAt.HasValue);
    }

    private static JsonElement? ParsePayload(string? payload) {
        if (string.IsNullOrWhiteSpace(payload)) {
            return null;
        }

        using var document = JsonDocument.Parse(payload);
        return document.RootElement.Clone();
    }
}
