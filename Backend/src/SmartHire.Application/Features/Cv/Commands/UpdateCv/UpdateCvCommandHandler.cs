using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Cv.Commands.CreateCv;
using SmartHire.Application.Features.Cv.Mapping;
using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Cv.Commands.UpdateCv;

public sealed class UpdateCvCommandHandler : IRequestHandler<UpdateCvCommand, CvResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICvRepository _cvRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICvVersionRepository _cvVersionRepository;
    
    public UpdateCvCommandHandler(
        ICurrentUser currentUser,
        ICvRepository cvRepository,
        ICvVersionRepository cvVersionRepository,
        IUnitOfWork unitOfWork
    ) {
        _currentUser = currentUser;
        _cvRepository = cvRepository;
        _cvVersionRepository = cvVersionRepository;
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
        if (now <= cv.UpdatedAt) {
            now = cv.UpdatedAt.AddTicks(TimeSpan.TicksPerMicrosecond);
        }
        
        if (content.Metadata is null || presentation.Metadata is null) {
            var metadataErrors = new List<AppErrorDetail>();
            if (content.Metadata is null) {
                metadataErrors.Add(new AppErrorDetail("content.metadata", ValidationReasons.Required,
                    "Content metadata is required."));
            }
            
            if (presentation.Metadata is null) {
                metadataErrors.Add(new AppErrorDetail("presentation.metadata", ValidationReasons.Required,
                    "Presentation metadata is required."));
            }
            
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "CV documents contain invalid fields.",
                metadataErrors);
        }
        
        var language = validated.LanguageProvided
            ? validated.ParsedLanguage!.Value
            : validated.ContentProvided
                ? content.Metadata.Language
                : cv.Language;
        
        presentation = CvDocumentUpdateValidator.RemoveOrphanedItemStyles(content, presentation);
        
        var isPublic = cv.IsPublic;
        if (validated.IsPublicProvided) {
            isPublic = validated.IsPublic!.Value;
        }
        
        bool isVersioningRequired =
            validated.ContentProvided || validated.LayoutProvided || validated.PresentationProvided;
        
        try {
            if (isVersioningRequired) {
                var latestVersionNumber = await _cvVersionRepository.GetLatestVersionNumberAsync(
                    cv.Id,
                    cancellationToken
                );
                if (latestVersionNumber == int.MaxValue) {
                    throw CreateVersionConflictException();
                }
                
                return await HandleUpdateWithVersioning(
                    cv,
                    latestVersionNumber,
                    () => cv.UpdateDocuments(
                        content,
                        layout,
                        presentation,
                        language,
                        latestVersionNumber,
                        now
                    ),
                    now,
                    cancellationToken);
            }
            else {
                return await HandlerSimpleUpdate(
                    cv,
                    () => cv.Update(
                        validated.TitleProvided ? validated.Title! : cv.Title,
                        now,
                        isPublic
                    ),
                    cancellationToken
                );
            }
        }
        catch (OptimisticConcurrencyException) {
            throw CreateVersionConflictException();
        }
    }
    
    private async Task<CvResult> HandlerSimpleUpdate(
        Domain.Entities.Cv cv,
        Action updateAction,
        CancellationToken cancellationToken
    ) {
        updateAction();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        return CvResultMapper.ToResult(cv, cv.Template);
    }
    
    private async Task<CvResult> HandleUpdateWithVersioning(
        Domain.Entities.Cv cv,
        int latestVersionNumber,
        Action updateAction,
        DateTimeOffset now,
        CancellationToken cancellationToken
    ) {
        return await _unitOfWork.ExecuteInTransactionAsync(
            async (transactionToken) => {
                updateAction();
                
                var documentErrors = CvDocumentUpdateValidator.Validate(
                    cv.Content,
                    cv.Layout,
                    cv.Presentation);
                if (documentErrors.Count > 0) {
                    throw new AppException(
                        AppErrorKind.Validation,
                        CommonErrorCodes.ValidationError,
                        "CV documents contain invalid fields.",
                        documentErrors);
                }
                
                var version = cv.CreateVersion(
                    latestVersionNumber + 1,
                    now
                );
                await _cvVersionRepository.Add(version);
                await _unitOfWork.SaveChangesAsync(transactionToken);
                
                return CvResultMapper.ToResult(cv, cv.Template);
            },
            cancellationToken);
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
    
    private static AppException CreateVersionConflictException() => new(
        AppErrorKind.Conflict,
        CvErrorCodes.CvUpdateConflict,
        "CV was updated by another request. Reload it and retry.",
        [
            new AppErrorDetail("id", ErrorDetailReasons.ConcurrentModification,
                "The CV changed while its new version was being created.")
        ]);
}