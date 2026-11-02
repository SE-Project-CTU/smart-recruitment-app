using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;
using SmartHire.Application.Features.Ai.Mapping;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Ai.Commands.CreateConversation;

public sealed class CreateConversationCommandHandler : IRequestHandler<CreateConversationCommand, AiConversationSummaryDto> {
    private readonly IAiConversationRepository _conversationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;
    private const int MaxConversationsPerCandidate = 20;

    public CreateConversationCommandHandler(
        IAiConversationRepository conversationRepository,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser) {
        _conversationRepository = conversationRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<AiConversationSummaryDto> Handle(CreateConversationCommand request, CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        var candidateId = _currentUser.UserId.Value;

        // Quota check: Giới hạn tối đa 20 cuộc trò chuyện đang hoạt động
        var count = await _conversationRepository.CountByCandidateIdAsync(candidateId, cancellationToken);
        if (count >= MaxConversationsPerCandidate) {
            var oldestUnpinned = await _conversationRepository.GetOldestUnpinnedAsync(candidateId, cancellationToken);
            if (oldestUnpinned != null) {
                _conversationRepository.Delete(oldestUnpinned);
            }
        }

        var title = string.IsNullOrWhiteSpace(request.Title) ? "Cuộc trò chuyện mới" : request.Title.Trim();
        var conversation = AiConversation.Create(candidateId, title, request.CvId);

        await _conversationRepository.AddAsync(conversation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return AiConversationMapper.ToSummaryDto(conversation);
    }
}

