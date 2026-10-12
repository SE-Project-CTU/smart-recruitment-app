using System.Transactions;
using MediatR;
using SmartHire.Application.Features.Cv.Mapping;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Validation;

namespace SmartHire.Application.Features.Cv.Commands.CreateCv;

public sealed class CreateCvCommandHandler : IRequestHandler<CreateCvCommand, CvResult> {
    private readonly ICvRepository _cvRepository;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly IUserRoleRepository _userRoleRepository;
    private readonly ICvTemplateRepository _cvTemplateRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUser _currentUser;
    
    public CreateCvCommandHandler(
        ICvRepository cvRepository,
        ICvVersionRepository cvVersionRepository,
        IUserRoleRepository userRoleRepository,
        ICvTemplateRepository cvTemplateRepository,
        IUnitOfWork unitOfWork,
        ICurrentUser currentUser
    ) {
        _cvRepository = cvRepository;
        _cvVersionRepository = cvVersionRepository;
        _userRoleRepository = userRoleRepository;
        _cvTemplateRepository = cvTemplateRepository;
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }
    
    public async Task<CvResult> Handle(CreateCvCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid candidateId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }
        
        var validatedRequest = CreateCvCommandValidator.Validate(request, candidateId);
        var candidateRoles = await _userRoleRepository.GetAllByUserIdAsync(
            candidateId,
            cancellationToken
        );
        
        if (candidateRoles.All(role => role.Role.Name != RoleNames.Candidate)) {
            throw new AppException(
                AppErrorKind.Forbidden,
                CvErrorCodes.CandidateRoleRequired,
                "Only Candidate users can create a CV.");
        }
        
        var template = await _cvTemplateRepository.GetByIdAsync(
            validatedRequest.TemplateId,
            tracking: false,
            cancellationToken);
        
        if (template is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CvTemplateErrorCodes.TemplateNotFound,
                "CV template was not found.");
        }
        
        if (!template.IsActive) {
            throw new AppException(
                AppErrorKind.Conflict,
                CvTemplateErrorCodes.TemplateInactive,
                "CV template is no longer active.");
        }
        
        return await _unitOfWork.ExecuteInTransactionAsync(
            async transactionToken => {
                var cvTemplate =
                    await _cvTemplateRepository.GetActiveByIdAsync(validatedRequest.TemplateId, transactionToken);
                
                if (cvTemplate is null) {
                    throw new AppException(
                        AppErrorKind.NotFound,
                        CvTemplateErrorCodes.TemplateNotFound,
                        "CV template was not found."
                    );
                }
                
                var now = DateTimeOffset.UtcNow;
                var content = cvTemplate.DefaultContent;
                var language = validatedRequest.Language is null
                    ? content.Metadata.Language
                    : CvValidator.ParseLanguageCode(validatedRequest.Language);
                
                var newCv = Domain.Entities.Cv.Create(
                    candidateId,
                    validatedRequest.TemplateId,
                    validatedRequest.Title!,
                    cvTemplate.DefaultContent,
                    cvTemplate.DefaultLayout,
                    cvTemplate.DefaultPresentation,
                    language,
                    now
                );
                
                await _cvRepository.Add(newCv);
                await _unitOfWork.SaveChangesAsync(transactionToken);
                
                var newCvVersion = newCv.CreateInitialVersion(now);
                await _cvVersionRepository.Add(newCvVersion);
                await _unitOfWork.SaveChangesAsync(transactionToken);
                
                return CvResultMapper.ToResult(newCv, cvTemplate);
            },
            cancellationToken
        );
    }
}