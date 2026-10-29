using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Ai.Exceptions;

namespace SmartHire.Application.Features.Ai.Commands.DeleteAllConversations;

public sealed record DeleteAllConversationsCommand : IRequest<int>;

public sealed class DeleteAllConversationsCommandHandler : IRequestHandler<DeleteAllConversationsCommand, int> {
    private readonly IAiConversationRepository _conversationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;

    public DeleteAllConversationsCommandHandler(
        IAiConversationRepository conversationRepository,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser) {
        _conversationRepository = conversationRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<int> Handle(DeleteAllConversationsCommand request, CancellationToken cancellationToken) {
        if (!_currentUser.UserId.HasValue) {
            throw AiExceptions.InvalidAccessToken();
        }

        var candidateId = _currentUser.UserId.Value;
        var deletedCount = await _conversationRepository.DeleteAllByCandidateIdAsync(candidateId, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return deletedCount;
    }
}
