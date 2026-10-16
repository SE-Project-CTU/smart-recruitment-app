using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Cv.Exceptions;

namespace SmartHire.Application.Features.Cv.Queries.GetMyCvs;

public sealed class GetMyCvsQueryHandler
    : IRequestHandler<GetMyCvsQuery, CvPageResult> {
    private readonly ICvRepository _cvRepository;
    private readonly ICurrentUser _currentUser;
    
    public GetMyCvsQueryHandler(
        ICvRepository cvRepository,
        ICurrentUser currentUser) {
        _cvRepository = cvRepository;
        _currentUser = currentUser;
    }
    
    public async Task<CvPageResult> Handle(
        GetMyCvsQuery request,
        CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid candidateId) {
            throw CvExceptions.InvalidAccessToken(
                "The access token does not contain a valid user id.");
        }
        
        var validated = GetMyCvsQueryValidator.Validate(request);
        var totalItems = await _cvRepository.CountMineAsync(
            candidateId,
            validated.IsPublic,
            validated.Language,
            cancellationToken);
        var items = await _cvRepository.GetMinePageAsync(
            candidateId,
            validated.IsPublic,
            validated.Language,
            validated.Skip,
            validated.PageSize,
            cancellationToken);
        
        return new CvPageResult(
            items,
            validated.Page,
            validated.PageSize,
            totalItems
        );
    }
}