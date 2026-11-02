namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record AiConversationListResponse(
    IReadOnlyList<AiConversationSummaryDto> Pinned,
    IReadOnlyList<AiConversationSummaryDto> Recent,
    int TotalCount
);

