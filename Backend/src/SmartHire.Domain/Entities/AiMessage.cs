namespace SmartHire.Domain.Entities;

public class AiMessage {
    public Guid Id { get; private set; }
    public Guid ConversationId { get; private set; }
    public AiConversation Conversation { get; private set; } = null!;
    public string Sender { get; private set; } = "USER"; // "USER" | "AI"
    public string Content { get; private set; } = string.Empty;
    public string? MetadataJson { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private AiMessage() { }

    public static AiMessage Create(
        Guid conversationId,
        string sender,
        string content,
        string? metadataJson = null) {
        return new AiMessage {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            Sender = sender.ToUpperInvariant(),
            Content = content,
            MetadataJson = metadataJson,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public static AiMessage CreateUserMessage(Guid conversationId, string content) {
        return Create(conversationId, "USER", content);
    }

    public static AiMessage CreateAiMessage(Guid conversationId, string content, string? metadataJson = null) {
        return Create(conversationId, "AI", content, metadataJson);
    }
}
