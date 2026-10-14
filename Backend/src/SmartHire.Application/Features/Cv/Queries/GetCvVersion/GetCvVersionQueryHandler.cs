using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

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
            throw CvVersionQueryErrors.CvNotFound();
        }

        CvVersionQueryErrors.EnsureOwner(_currentUser.UserId, candidateId.Value);

        var version = await _cvVersionRepository.GetByIdAsync(
            validated.CvId,
            validated.VersionId,
            cancellationToken);

        if (version is null)
        {
            throw new AppException(
                AppErrorKind.NotFound,
                CvErrorCodes.CvVersionNotFound,
                "CV version was not found.",
                [new AppErrorDetail(
                    "versionId",
                    ErrorDetailReasons.NotFound,
                    "The requested version does not exist for this CV.")]);
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
