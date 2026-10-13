using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;

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
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "CV id must be a valid UUID.",
                [new AppErrorDetail("id", ValidationReasons.InvalidFormat,
                    "Provide a non-empty CV id.")]);
        }

        if (_currentUser.UserId is not Guid candidateId)
        {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "A valid access token is required.",
                [new AppErrorDetail("userId", ValidationReasons.InvalidFormat,
                    "A valid user identity could not be read from the access token.")]);
        }

        if (!_currentUser.Roles.Contains(RoleNames.Candidate, StringComparer.OrdinalIgnoreCase))
        {
            throw new AppException(
                AppErrorKind.Forbidden,
                CvErrorCodes.CandidateRoleRequired,
                "Only Candidate users can delete CVs.",
                [new AppErrorDetail("role", ValidationReasons.NotAllowed,
                    "The current user must have the Candidate role.")]);
        }

        var cv = await _cvRepository.GetForUpdateByIdAsync(request.Id, cancellationToken);
        if (cv is null)
        {
            throw new AppException(
                AppErrorKind.NotFound,
                CvErrorCodes.CvNotFound,
                "CV was not found.",
                [new AppErrorDetail("id", ErrorDetailReasons.NotFound,
                    "The requested CV does not exist.")]);
        }

        if (cv.CandidateId != candidateId)
        {
            throw new AppException(
                AppErrorKind.Forbidden,
                CvErrorCodes.CvNotOwned,
                "You are not allowed to delete this CV.",
                [new AppErrorDetail("id", ValidationReasons.NotAllowed,
                    "Only the CV owner can delete it.")]);
        }

        cv.Archive(DateTimeOffset.UtcNow);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
