using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.Exceptions;

namespace SmartHire.Application.Features.Ai.Commands.DeleteConversation;

public sealed record DeleteConversationCommand(Guid ConversationId) : IRequest<bool>;

public sealed class DeleteConversationCommandHandler : IRequestHandler<DeleteConversationCommand, bool> {
    private readonly IAiConversationRepository _conversationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;

    public DeleteConversationCommandHandler(
        IAiConversationRepository conversationRepository,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser) {
        _conversationRepository = conversationRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(DeleteConversationCommand request, CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken);
        if (conversation == null) {
            throw AiExceptions.NotFound("Cuộc trò chuyện không tồn tại.");
        }

        if (conversation.CandidateId != _currentUser.UserId.Value) {
            throw AiExceptions.Forbidden("Bạn không có quyền xóa cuộc trò chuyện này.");
        }

        _conversationRepository.Delete(conversation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
