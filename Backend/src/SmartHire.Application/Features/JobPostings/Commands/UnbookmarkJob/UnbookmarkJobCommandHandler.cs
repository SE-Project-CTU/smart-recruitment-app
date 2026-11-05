using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.JobPostings.Exceptions;

namespace SmartHire.Application.Features.JobPostings.Commands.UnbookmarkJob;

public sealed class UnbookmarkJobCommandHandler : IRequestHandler<UnbookmarkJobCommand> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobBookmarkRepository _jobBookmarkRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UnbookmarkJobCommandHandler(
        ICurrentUser currentUser,
        IJobBookmarkRepository jobBookmarkRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _jobBookmarkRepository = jobBookmarkRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(UnbookmarkJobCommand request, CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw JobPostingExceptions.InvalidAccessToken();

        var bookmark = await _jobBookmarkRepository.GetAsync(userId, request.JobPostingId, cancellationToken);
        if (bookmark is null) {
            throw JobPostingExceptions.JobBookmarkNotFound();
        }

        _jobBookmarkRepository.Delete(bookmark);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}

