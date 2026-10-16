using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Cv.Exceptions;

namespace SmartHire.Application.Features.Cv.Commands.DeleteCv;

public sealed class DeleteCvCommandHandler : IRequestHandler<DeleteCvCommand>
{
    private readonly ICurrentUser _currentUser;
    private readonly ICvRepository _cvRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteCvCommandHandler(
        ICurrentUser currentUser,
        ICvRepository cvRepository,
        IUnitOfWork unitOfWork)
    {
        _currentUser = currentUser;
        _cvRepository = cvRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(DeleteCvCommand request, CancellationToken cancellationToken)
    {
        if (request.Id == Guid.Empty)
        {
            throw CvExceptions.InvalidCvId();
        }

        if (_currentUser.UserId is not Guid candidateId)
        {
            throw CvExceptions.InvalidAccessToken("A valid access token is required.");
        }

        if (!_currentUser.Roles.Contains(RoleNames.Candidate, StringComparer.OrdinalIgnoreCase))
        {
            throw CvExceptions.CandidateRoleRequired("delete");
        }

        var cv = await _cvRepository.GetForUpdateByIdAsync(request.Id, cancellationToken);
        if (cv is null)
        {
            throw CvExceptions.CvNotFound();
        }

        if (cv.CandidateId != candidateId)
        {
            throw CvExceptions.CvNotOwned("delete");
        }

        cv.Archive(DateTimeOffset.UtcNow);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
