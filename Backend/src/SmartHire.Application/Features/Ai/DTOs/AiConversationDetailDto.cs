namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record AiConversationDetailDto(
    Guid Id,
    string Title,
    bool IsPinned,
    Guid? CvId,
    DateTimeOffset LastMessageAt,
    DateTimeOffset CreatedAt,
    IReadOnlyList<AiMessageDto> Messages
);

