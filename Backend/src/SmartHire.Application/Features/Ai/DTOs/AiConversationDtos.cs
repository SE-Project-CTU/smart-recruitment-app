namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record AiMessageDto(
    Guid Id,
    string Sender,
    string Content,
    string? MetadataJson,
    DateTimeOffset CreatedAt
);

public sealed record AiConversationSummaryDto(
    Guid Id,
    string Title,
    bool IsPinned,
    Guid? CvId,
    DateTimeOffset LastMessageAt,
    DateTimeOffset CreatedAt,
    int MessageCount = 0
);

public sealed record AiConversationDetailDto(
    Guid Id,
    string Title,
    bool IsPinned,
    Guid? CvId,
    DateTimeOffset LastMessageAt,
    DateTimeOffset CreatedAt,
    IReadOnlyList<AiMessageDto> Messages
);

public sealed record AiConversationListResponse(
    IReadOnlyList<AiConversationSummaryDto> Pinned,
    IReadOnlyList<AiConversationSummaryDto> Recent,
    int TotalCount
);
