using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Cv.Commands.CreateCv;
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
            throw new AppException(
                AppErrorKind.NotFound,
                CvErrorCodes.CvNotFound,
                "CV was not found.",
                [
                    new AppErrorDetail(
                        "id",
                        ErrorDetailReasons.NotFound,
                        "The requested CV does not exist."
                    )
                ]
            );
        }
        
        if (_currentUser.UserId != cv.CandidateId && !cv.IsPublic) {
            throw new AppException(
                AppErrorKind.Forbidden,
                AuthErrorCodes.AccountNotAllowed,
                "You are not authorized to access this resource."
            );
        }
        
        return CvResultMapper.ToResult(cv, cv.Template);
    }
}
