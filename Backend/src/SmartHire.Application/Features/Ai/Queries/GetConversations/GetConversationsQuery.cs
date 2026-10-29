using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;

namespace SmartHire.Application.Features.Ai.Queries.GetConversations;

public sealed record GetConversationsQuery(string? Search = null) : IRequest<AiConversationListResponse>;

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

        var pinned = conversations
            .Where(c => c.IsPinned)
            .Select(c => new AiConversationSummaryDto(c.Id, c.Title, c.IsPinned, c.CvId, c.LastMessageAt, c.CreatedAt, c.Messages.Count))
            .ToList();

        var recent = conversations
            .Where(c => !c.IsPinned)
            .Select(c => new AiConversationSummaryDto(c.Id, c.Title, c.IsPinned, c.CvId, c.LastMessageAt, c.CreatedAt, c.Messages.Count))
            .ToList();

        return new AiConversationListResponse(pinned, recent, conversations.Count);
    }
}
