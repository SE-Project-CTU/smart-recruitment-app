namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record AiConversationSummaryDto(
    Guid Id,
    string Title,
    bool IsPinned,
    Guid? CvId,
    DateTimeOffset LastMessageAt,
    DateTimeOffset CreatedAt,
    int MessageCount = 0
);

