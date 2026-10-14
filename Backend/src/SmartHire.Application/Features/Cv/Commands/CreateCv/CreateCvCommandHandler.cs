using System.Transactions;
using MediatR;
using SmartHire.Application.Features.Cv.Mapping;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Cv.Exceptions;
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
            throw CvExceptions.InvalidAccessToken(
                "The access token does not contain a valid user id.");
        }
        
        var validatedRequest = CreateCvCommandValidator.Validate(request, candidateId);
        var candidateRoles = await _userRoleRepository.GetAllByUserIdAsync(
            candidateId,
            cancellationToken
        );
        
        if (candidateRoles.All(role => role.Role.Name != RoleNames.Candidate)) {
            throw CvExceptions.CandidateRoleRequired("create");
        }
        
        return await _unitOfWork.ExecuteInTransactionAsync(
            async transactionToken => {
                var cvTemplate = await _cvTemplateRepository.GetByIdAsync(
                    validatedRequest.TemplateId,
                    tracking: false,
                    transactionToken);
                
                if (cvTemplate is null) {
                    throw CvExceptions.TemplateNotFound();
                }
                
                if (!cvTemplate.IsActive) {
                    throw CvExceptions.TemplateInactive();
                }
                
                var now = DateTimeOffset.UtcNow;
                var content = cvTemplate.DefaultContent;
                var language = validatedRequest.Language is null
                    ? content.Metadata.Language
                    : CvValidator.ParseLanguageCode(validatedRequest.Language);
                
                var newCv = Domain.Entities.Cv.Create(
                    candidateId,
                    validatedRequest.TemplateId,
                    cvTemplate.Code,
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
