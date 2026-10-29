using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;

namespace SmartHire.Application.Features.Ai.Queries.GetConversationDetail;

public sealed record GetConversationDetailQuery(Guid ConversationId) : IRequest<AiConversationDetailDto>;

public sealed class GetConversationDetailQueryHandler : IRequestHandler<GetConversationDetailQuery, AiConversationDetailDto> {
    private readonly IAiConversationRepository _conversationRepository;
    private readonly ICurrentUser _currentUser;

    public GetConversationDetailQueryHandler(
        IAiConversationRepository conversationRepository,
        ICurrentUser currentUser) {
        _conversationRepository = conversationRepository;
        _currentUser = currentUser;
    }

    public async Task<AiConversationDetailDto> Handle(GetConversationDetailQuery request, CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        var conversation = await _conversationRepository.GetByIdWithMessagesAsync(request.ConversationId, cancellationToken);
        if (conversation == null) {
            throw AiExceptions.NotFound("Cuộc trò chuyện không tồn tại.");
        }

        if (conversation.CandidateId != _currentUser.UserId.Value) {
            throw AiExceptions.Forbidden("Bạn không có quyền truy cập cuộc trò chuyện này.");
        }

        var messages = conversation.Messages
            .OrderBy(m => m.CreatedAt)
            .Select(m => new AiMessageDto(m.Id, m.Sender, m.Content, m.MetadataJson, m.CreatedAt))
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
}
