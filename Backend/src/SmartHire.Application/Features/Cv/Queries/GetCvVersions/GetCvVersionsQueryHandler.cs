using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Cv.DTOs;
using SmartHire.Application.Features.Cv.Exceptions;

namespace SmartHire.Application.Features.Cv.Queries.GetCvVersions;

public sealed class GetCvVersionsQueryHandler
    : IRequestHandler<GetCvVersionsQuery, CvVersionPageResult>
{
    private readonly ICvRepository _cvRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly ICurrentUser _currentUser;

    public GetCvVersionsQueryHandler(
        ICvRepository cvRepository,
        ICvVersionRepository cvVersionRepository,
        ICurrentUser currentUser)
    {
        _cvRepository = cvRepository;
        _cvVersionRepository = cvVersionRepository;
        _currentUser = currentUser;
    }

    public async Task<CvVersionPageResult> Handle(
        GetCvVersionsQuery request,
        CancellationToken cancellationToken)
    {
        var validated = GetCvVersionsQueryValidator.Validate(request);
        var candidateId = await _cvRepository.GetCandidateIdByCvIdAsync(
            validated.CvId,
            cancellationToken);

        if (candidateId is null)
        {
            throw CvExceptions.CvNotFound();
        }

        CvExceptions.EnsureOwner(_currentUser.UserId, candidateId.Value);

        var totalItems = await _cvVersionRepository.CountByCvIdAsync(
            validated.CvId,
            cancellationToken);
        var versions = await _cvVersionRepository.GetPageByCvIdAsync(
            validated.CvId,
            validated.Skip,
            validated.PageSize,
            cancellationToken);

        return new CvVersionPageResult(
            versions,
            validated.Page,
            validated.PageSize,
            totalItems);
    }
}
