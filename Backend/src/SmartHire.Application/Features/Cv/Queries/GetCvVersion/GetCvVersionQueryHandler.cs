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
    private readonly ICurrentUser _currentUser;

    public GetCvVersionQueryHandler(
        ICvRepository cvRepository,
        ICvVersionRepository cvVersionRepository,
        ICurrentUser currentUser)
    {
        _cvRepository = cvRepository;
        _cvVersionRepository = cvVersionRepository;
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

        var isOwner = _currentUser.UserId.HasValue && _currentUser.UserId.Value == candidateId.Value;
        var isRecruiterOrAdmin = _currentUser.Roles.Contains(RoleNames.Recruiter) ||
                                 _currentUser.Roles.Contains(RoleNames.Admin);

        if (!isOwner && !isRecruiterOrAdmin)
        {
            CvExceptions.EnsureOwner(_currentUser.UserId, candidateId.Value);
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
