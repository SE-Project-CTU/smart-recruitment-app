using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.DTOs;
using SmartHire.Application.Features.Ai.Exceptions;

namespace SmartHire.Application.Features.Ai.Commands.TogglePin;

public sealed record TogglePinCommand(Guid ConversationId, bool? IsPinned = null) : IRequest<AiConversationSummaryDto>;

public sealed class TogglePinCommandHandler : IRequestHandler<TogglePinCommand, AiConversationSummaryDto> {
    private readonly IAiConversationRepository _conversationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;

    public TogglePinCommandHandler(
        IAiConversationRepository conversationRepository,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser) {
        _conversationRepository = conversationRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<AiConversationSummaryDto> Handle(TogglePinCommand request, CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken);
        if (conversation == null) {
            throw AiExceptions.NotFound("Cuộc trò chuyện không tồn tại.");
        }

        if (conversation.CandidateId != _currentUser.UserId.Value) {
            throw AiExceptions.Forbidden("Bạn không có quyền thao tác trên cuộc trò chuyện này.");
        }

        if (request.IsPinned.HasValue) {
            conversation.SetPin(request.IsPinned.Value);
        } else {
            conversation.TogglePin();
        }

        _conversationRepository.Update(conversation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AiConversationSummaryDto(
            conversation.Id,
            conversation.Title,
            conversation.IsPinned,
            conversation.CvId,
            conversation.LastMessageAt,
            conversation.CreatedAt
        );
    }
}
