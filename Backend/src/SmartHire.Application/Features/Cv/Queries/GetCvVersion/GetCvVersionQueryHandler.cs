using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Cv.DTOs;
using SmartHire.Application.Features.Cv.Exceptions;

namespace SmartHire.Application.Features.Cv.Queries.GetCvVersion;

public sealed class GetCvVersionQueryHandler
    : IRequestHandler<GetCvVersionQuery, CvVersionResult>
{
    private readonly ICvRepository _cvRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly ICurrentUser _currentUser;

    public GetCvVersionQueryHandler(
        ICvRepository cvRepository,
        ICvVersionRepository cvVersionRepository,
        IJobApplicationRepository applicationRepository,
        ICurrentUser currentUser)
    {
        _cvRepository = cvRepository;
        _cvVersionRepository = cvVersionRepository;
        _applicationRepository = applicationRepository;
        _currentUser = currentUser;
    }

    public async Task<CvVersionResult> Handle(
        GetCvVersionQuery request,
        CancellationToken cancellationToken)
    {
        var validated = GetCvVersionQueryValidator.Validate(request);
        var candidateId = await _cvRepository.GetCandidateIdByCvIdAsync(
            validated.CvId,
            cancellationToken);

        if (candidateId is null)
        {
            throw CvExceptions.CvNotFound();
        }

        var userId = _currentUser.UserId ?? throw CvExceptions.InvalidAccessToken("The access token does not contain a valid user id.");
        var isOwner = userId == candidateId.Value;

        if (!isOwner)
        {
            var isAdmin = _currentUser.Roles.Contains(RoleNames.Admin);
            if (!isAdmin)
            {
                var isRecruiter = _currentUser.Roles.Contains(RoleNames.Recruiter);
                if (!isRecruiter)
                {
                    CvExceptions.EnsureOwner(userId, candidateId.Value);
                }

                var hasAccess = await _applicationRepository.CanRecruiterAccessCvVersionAsync(
                    validated.CvId,
                    validated.VersionId,
                    userId,
                    cancellationToken);

                if (!hasAccess)
                {
                    throw CvExceptions.AccountNotAllowed();
                }
            }
        }

        var version = await _cvVersionRepository.GetByIdAsync(
            validated.CvId,
            validated.VersionId,
            cancellationToken);

        if (version is null)
        {
            throw CvExceptions.CvVersionNotFound();
        }

        return new CvVersionResult(
            version.Id,
            version.CvId,
            version.TemplateId,
            version.Content,
            version.Layout,
            version.Presentation,
            version.Language,
            version.VersionNumber,
            version.CreatedAt);
    }
}
