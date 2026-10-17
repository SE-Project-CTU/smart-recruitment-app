namespace SmartHire.Application.Features.Notifications.DTOs;

public sealed record NotificationDto(
    Guid Id,
    Guid RecipientId,
    string Type,
    string Title,
    string Body,
    string? Payload,
    string? ResourceType,
    Guid? ResourceId,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ReadAt,
    DateTimeOffset? ExpiresAt,
    bool IsRead
);

public sealed record UnreadCountResult(int UnreadCount);
