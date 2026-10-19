using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class Notification {
    public Guid Id { get; private set; }
    public Guid RecipientId { get; private set; }
    public User Recipient { get; private set; } = null!;
    public NotificationType Type { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public string? Payload { get; private set; }
    public string? ResourceType { get; private set; }
    public Guid? ResourceId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? ReadAt { get; private set; }
    public DateTimeOffset? ExpiresAt { get; private set; }

    private Notification() { }

    public static Notification Create(
        Guid recipientId,
        NotificationType type,
        string title,
        string body,
        string? payload = null,
        string? resourceType = null,
        Guid? resourceId = null,
        DateTimeOffset? expiresAt = null,
        DateTimeOffset? now = null
    ) {
        if (recipientId == Guid.Empty) {
            throw new ArgumentException("Recipient ID is required.", nameof(recipientId));
        }
        if (string.IsNullOrWhiteSpace(title)) {
            throw new ArgumentException("Title is required.", nameof(title));
        }
        if (string.IsNullOrWhiteSpace(body)) {
            throw new ArgumentException("Body is required.", nameof(body));
        }

        var createdAt = now ?? DateTimeOffset.UtcNow;

        return new Notification {
            Id = Guid.NewGuid(),
            RecipientId = recipientId,
            Type = type,
            Title = title,
            Body = body,
            Payload = payload,
            ResourceType = resourceType,
            ResourceId = resourceId,
            CreatedAt = createdAt,
            ExpiresAt = expiresAt
        };
    }

    public void MarkAsRead(DateTimeOffset? now = null) {
        ReadAt = now ?? DateTimeOffset.UtcNow;
    }

    public bool IsRead => ReadAt.HasValue;
}
