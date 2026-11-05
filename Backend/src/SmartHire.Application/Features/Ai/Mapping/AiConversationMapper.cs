using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Mapping;

public static class AiConversationMapper {
    public static AiMessageDto ToMessageDto(AiMessage message) {
        return new AiMessageDto(
            message.Id,
            message.Sender,
            message.Content,
            message.MetadataJson,
            message.CreatedAt
        );
    }

    public static AiConversationSummaryDto ToSummaryDto(AiConversation conversation, int messageCount = 0) {
        return new AiConversationSummaryDto(
            conversation.Id,
            conversation.Title,
            conversation.IsPinned,
            conversation.CvId,
            conversation.LastMessageAt,
            conversation.CreatedAt,
            messageCount
        );
    }

    public static AiConversationDetailDto ToDetailDto(AiConversation conversation) {
        var messages = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(ToMessageDto)
            .ToList();

        return new AiConversationDetailDto(
            conversation.Id,
            conversation.Title,
            conversation.IsPinned,
            conversation.CvId,
            conversation.LastMessageAt,
            conversation.CreatedAt,
            messages
        );
    }

    public static AiConversationListResponse ToListResponse(IReadOnlyList<AiConversation> conversations) {
        var pinned = conversations
            .Where(c => c.IsPinned)
            .Select(c => ToSummaryDto(c, c.Messages.Count))
            .ToList();

        var recent = conversations
            .Where(c => !c.IsPinned)
            .Select(c => ToSummaryDto(c, c.Messages.Count))
            .ToList();

        return new AiConversationListResponse(pinned, recent, conversations.Count);
    }
}

