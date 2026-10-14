using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Cv.Commands.CreateCv;
using SmartHire.Application.Features.Cv.Mapping;
using SmartHire.Domain.Enums;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Cv.Commands.UpdateCv;

public sealed class UpdateCvCommandHandler : IRequestHandler<UpdateCvCommand, CvResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICvRepository _cvRepository;
    private readonly ICvTemplateRepository _cvTemplateRepository;
    private readonly IUnitOfWork _unitOfWork;
    
    public UpdateCvCommandHandler(
        ICurrentUser currentUser,
        ICvRepository cvRepository,
        ICvTemplateRepository cvTemplateRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _cvRepository = cvRepository;
        _cvTemplateRepository = cvTemplateRepository;
        _unitOfWork = unitOfWork;
    }
    
    public async Task<CvResult> Handle(
        UpdateCvCommand request,
        CancellationToken cancellationToken) {
        var validated = UpdateCvCommandValidator.Validate(request);
        var candidateId = GetCandidateId();
        
        var cv = await _cvRepository.GetForUpdateByIdAsync(validated.Id, cancellationToken);
        if (cv is null) {
            throw CreateCvNotFoundException();
        }
        
        if (cv.CandidateId != candidateId) {
            throw CreateCvForbiddenException();
        }
        
        var template = cv.Template;
        
        var content = validated.ContentProvided ? validated.Content! : cv.Content;
        var layout = validated.LayoutProvided ? validated.Layout! : cv.Layout;
        var presentation = validated.PresentationProvided
            ? validated.Presentation!
            : cv.Presentation;
        
        var now = DateTimeOffset.UtcNow;
        var language = validated.LanguageProvided
            ? validated.ParsedLanguage!.Value
            : validated.ContentProvided
                ? content.Metadata.Language
                : cv.Language;
        
        content = content with {
            Metadata = content.Metadata with {
                TemplateCode = template.Code,
                Language = language,
                UpdatedAt = now
            }
        };
        
        presentation = presentation with {
            Metadata = presentation.Metadata with {
                TemplateCode = template.Code,
                UpdatedAt = now
            }
        };
        
        presentation = CvDocumentUpdateValidator.RemoveOrphanedItemStyles(content, presentation);
        var documentErrors = CvDocumentUpdateValidator.Validate(content, layout, presentation);
        if (documentErrors.Count > 0) {
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "CV documents contain invalid fields.",
                documentErrors);
        }
        
        cv.Update(
            template,
            validated.TitleProvided ? validated.Title! : cv.Title,
            content,
            layout,
            presentation,
            language,
            now
        );
        
        try {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (OptimisticConcurrencyException) {
            throw new AppException(
                AppErrorKind.Conflict,
                CvErrorCodes.CvUpdateConflict,
                "CV was updated by another request. Reload it and retry.",
                [
                    new AppErrorDetail("id", ErrorDetailReasons.ConcurrentModification,
                        "The CV changed while this update was being processed.")
                ]);
        }
        
        return CvResultMapper.ToResult(cv, template);
    }
    
    private Guid GetCandidateId() {
        if (_currentUser.UserId is not Guid userId) {
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "A valid access token is required.",
                [
                    new AppErrorDetail("userId", ValidationReasons.InvalidFormat,
                        "A valid user identity could not be read from the access token.")
                ]);
        }
        
        if (!_currentUser.Roles.Contains(RoleNames.Candidate, StringComparer.OrdinalIgnoreCase)) {
            throw new AppException(
                AppErrorKind.Forbidden,
                CvErrorCodes.CandidateRoleRequired,
                "Only Candidate users can update CVs.",
                [
                    new AppErrorDetail("role", ValidationReasons.NotAllowed,
                        "The current user must have the Candidate role.")
                ]);
        }
        
        return userId;
    }
    
    private static AppException CreateCvNotFoundException() => new(
        AppErrorKind.NotFound,
        CvErrorCodes.CvNotFound,
        "CV was not found.",
        [
            new AppErrorDetail("id", ErrorDetailReasons.NotFound,
                "The requested CV does not exist.")
        ]);
    
    private static AppException CreateCvForbiddenException() => new(
        AppErrorKind.Forbidden,
        CvErrorCodes.CvNotOwned,
        "You are not allowed to update this CV.",
        [
            new AppErrorDetail("id", ValidationReasons.NotAllowed,
                "Only the CV owner can update it.")
        ]);
}