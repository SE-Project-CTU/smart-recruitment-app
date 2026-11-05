using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Application.Features.Ai.Mapping;

namespace SmartHire.Application.Features.Ai.Queries.GetConversations;

public sealed class GetConversationsQueryHandler : IRequestHandler<GetConversationsQuery, AiConversationListResponse> {
    private readonly IAiConversationRepository _conversationRepository;
    private readonly ICurrentUser _currentUser;

    public GetConversationsQueryHandler(
        IAiConversationRepository conversationRepository,
        ICurrentUser currentUser) {
        _conversationRepository = conversationRepository;
        _currentUser = currentUser;
    }

    public async Task<AiConversationListResponse> Handle(GetConversationsQuery request, CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        var candidateId = _currentUser.UserId.Value;
        var conversations = await _conversationRepository.GetByCandidateIdAsync(candidateId, request.Search, cancellationToken);

        return AiConversationMapper.ToListResponse(conversations);
    }
}

