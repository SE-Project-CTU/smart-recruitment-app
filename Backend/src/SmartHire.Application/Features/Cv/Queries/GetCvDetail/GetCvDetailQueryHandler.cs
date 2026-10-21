using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Cv.Commands.CreateCv;
using SmartHire.Application.Features.Cv.DTOs;
using SmartHire.Application.Features.Cv.Exceptions;
using SmartHire.Application.Features.Cv.Mapping;

namespace SmartHire.Application.Features.Cv.Queries.GetCvDetail;

public sealed class GetCvDetailQueryHandler : IRequestHandler<GetCvDetailQuery, CvResult> {
    private readonly ICvRepository _cvRepository;
    private readonly ICurrentUser _currentUser;
    
    public GetCvDetailQueryHandler(ICvRepository cvRepository, ICurrentUser currentUser) {
        _cvRepository = cvRepository;
        _currentUser = currentUser;
    }
    
    public async Task<CvResult> Handle(GetCvDetailQuery request, CancellationToken cancellationToken) {
        var validatedRequest = GetCvDetailQueryValidator.Validate(request);
        
        var cv = await _cvRepository.GetCvByIdAsync(validatedRequest.Id, cancellationToken);
        
        if (cv is null) {
            throw CvExceptions.CvNotFound();
        }
        
        if (_currentUser.UserId != cv.CandidateId && !cv.IsPublic) {
            throw CvExceptions.AccountNotAllowed();
        }
        
        return CvResultMapper.ToResult(cv, cv.Template);
    }
}
