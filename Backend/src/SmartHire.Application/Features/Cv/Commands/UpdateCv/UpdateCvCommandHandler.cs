using MediatR;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Serialization;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Cv.Commands.CreateCv;
using SmartHire.Application.Features.Cv.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Application.Features.Cv.Exceptions;
using SmartHire.Application.Features.Cv.Mapping;
using SmartHire.Application.Features.Media.Jobs.DeleteMediaFile;

namespace SmartHire.Application.Features.Cv.Commands.UpdateCv;

public sealed class UpdateCvCommandHandler : IRequestHandler<UpdateCvCommand, CvResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICvRepository _cvRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly ICvDocumentHasher _cvDocumentHasher;
    private readonly IMediaFileRepository _mediaFileRepository;
    private readonly IBackgroundJobScheduler _backgroundJobScheduler;
    
    public UpdateCvCommandHandler(
        ICurrentUser currentUser,
        ICvRepository cvRepository,
        ICvVersionRepository cvVersionRepository,
        IUnitOfWork unitOfWork,
        ICvDocumentHasher cvDocumentHasher,
        IMediaFileRepository mediaFileRepository,
        IBackgroundJobScheduler backgroundJobScheduler
    ) {
        _currentUser = currentUser;
        _cvRepository = cvRepository;
        _cvVersionRepository = cvVersionRepository;
        _unitOfWork = unitOfWork;
        _cvDocumentHasher = cvDocumentHasher;
        _mediaFileRepository = mediaFileRepository;
        _backgroundJobScheduler = backgroundJobScheduler;
    }
    
    public async Task<CvResult> Handle(
        UpdateCvCommand request,
        CancellationToken cancellationToken) {
        var validated = UpdateCvCommandValidator.Validate(request);
        var candidateId = GetCandidateId();
        
        var cv = await _cvRepository.GetForUpdateByIdAsync(validated.Id, cancellationToken);
        if (cv is null) {
            throw CvExceptions.CvNotFound();
        }
        
        if (cv.CandidateId != candidateId) {
            throw CvExceptions.CvNotOwned("update");
        }

        var oldPreviewFileId = cv.PreviewFileId;

        // Validate new preview file if provided
        MediaFile? newPreviewFile = null;
        if (validated.PreviewFileIdProvided && validated.PreviewFileId.HasValue) {
            newPreviewFile = await _mediaFileRepository.GetByIdAsync(
                validated.PreviewFileId.Value, cancellationToken);

            if (newPreviewFile is null) {
                throw CvExceptions.MediaFileNotFound("previewFileId", validated.PreviewFileId.Value);
            }

            if (newPreviewFile.OwnerId != candidateId) {
                throw CvExceptions.MediaFileForbidden("previewFileId");
            }

            var isAlreadyInUse = await _cvRepository.IsPreviewFileInUseAsync(
                validated.PreviewFileId.Value,
                cv.Id,
                cancellationToken);

            if (isAlreadyInUse) {
                throw CvExceptions.PreviewFileConflict("previewFileId");
            }
        }
        
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
            
            throw CvExceptions.Validation(
                "CV documents contain invalid fields.",
                metadataErrors);
        }
        
        var language = validated.LanguageProvided
            ? validated.ParsedLanguage!.Value
            : validated.ContentProvided
                ? content.Metadata.Language
                : cv.Language;

        content = content with {
            Metadata = content.Metadata with { Language = language }
        };
        
        if (validated.ContentProvided || validated.PresentationProvided) {
            presentation = CvDocumentUpdateValidator.RemoveOrphanedItemStyles(content, presentation);
        }
        
        var isPublic = cv.IsPublic;
        if (validated.IsPublicProvided) {
            isPublic = validated.IsPublic!.Value;
        }
        
        var currentHashes = _cvDocumentHasher.Calculate(
            cv.Content,
            cv.Presentation,
            cv.Layout);
        var proposedHashes = _cvDocumentHasher.Calculate(
            content,
            presentation,
            layout);

        var currentContentHash = cv.ContentHash ?? currentHashes.ContentHash;
        var currentPresentationHash = cv.PresentationHash ?? currentHashes.PresentationHash;
        var currentLayoutHash = cv.LayoutHash ?? currentHashes.LayoutHash;

        var contentComparisonRequired = validated.ContentProvided || language != cv.Language;
        var presentationComparisonRequired =
            validated.PresentationProvided || validated.ContentProvided;
        var layoutComparisonRequired = validated.LayoutProvided;

        var contentChanged = contentComparisonRequired && !string.Equals(
            proposedHashes.ContentHash,
            currentContentHash,
            StringComparison.Ordinal);
        var presentationChanged = presentationComparisonRequired && !string.Equals(
            proposedHashes.PresentationHash,
            currentPresentationHash,
            StringComparison.Ordinal);
        var layoutChanged = layoutComparisonRequired && !string.Equals(
            proposedHashes.LayoutHash,
            currentLayoutHash,
            StringComparison.Ordinal);
        var isVersioningRequired = contentChanged || presentationChanged || layoutChanged;

        var title = validated.TitleProvided ? validated.Title! : cv.Title;
        var titleChanged = !string.Equals(title, cv.Title, StringComparison.Ordinal);
        var visibilityChanged = isPublic != cv.IsPublic;

        CvPreviewFileResult? previewFileResult = validated.PreviewFileIdProvided
            ? (newPreviewFile is not null ? new CvPreviewFileResult(newPreviewFile.Id, newPreviewFile.FileUrl) : null)
            : (cv.PreviewFile is not null ? new CvPreviewFileResult(cv.PreviewFile.Id, cv.PreviewFile.FileUrl) : null);

        try {
            if (isVersioningRequired) {
                var latestVersionNumber = await _cvVersionRepository.GetLatestVersionNumberAsync(
                    cv.Id,
                    cancellationToken
                );
                if (latestVersionNumber == int.MaxValue) {
                    throw CvExceptions.CvUpdateConflict();
                }
                
                var result = await HandleUpdateWithVersioning(
                    cv,
                    latestVersionNumber,
                    previewFileResult,
                    () => {
                        cv.Update(title, isPublic, now);
                        if (validated.PreviewFileIdProvided) {
                            cv.SetPreviewFile(validated.PreviewFileId);
                        }

                        cv.UpdateDocuments(
                            content,
                            layout,
                            presentation,
                            language,
                            latestVersionNumber,
                            now);

                        // Hash again because the updated documents modified version.
                        var updatedHashes = _cvDocumentHasher.Calculate(
                            cv.Content,
                            cv.Presentation,
                            cv.Layout);
                        cv.SetDocumentHashes(
                            updatedHashes.ContentHash,
                            updatedHashes.PresentationHash,
                            updatedHashes.LayoutHash);
                    },
                    now,
                    cancellationToken);

                // Enqueue background job to delete old preview file only on update with versioning
                if (validated.PreviewFileIdProvided &&
                    oldPreviewFileId.HasValue &&
                    oldPreviewFileId.Value != validated.PreviewFileId) {
                    _backgroundJobScheduler.Enqueue<DeleteMediaFileJob, DeleteMediaFileJobArgs>(
                        new DeleteMediaFileJobArgs(oldPreviewFileId.Value)
                    );
                }

                return result;
            }
            else {
                return await HandlerSimpleUpdate(
                    cv,
                    () => {
                        if (titleChanged || visibilityChanged) {
                            cv.Update(title, isPublic, now);
                        }
                        
                        cv.SetDocumentHashes(
                            proposedHashes.ContentHash,
                            proposedHashes.PresentationHash,
                            proposedHashes.LayoutHash);
                    },
                    cancellationToken
                );
            }
        }
        catch (OptimisticConcurrencyException) {
            throw CvExceptions.CvUpdateConflict();
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
        CvPreviewFileResult? previewFileResult,
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
                    throw CvExceptions.Validation(
                        "CV documents contain invalid fields.",
                        documentErrors);
                }
                
                var version = cv.CreateVersion(
                    latestVersionNumber + 1,
                    now
                );
                await _cvVersionRepository.Add(version);
                await _unitOfWork.SaveChangesAsync(transactionToken);
                
                return CvResultMapper.ToResult(cv, cv.Template, previewFileResult);
            },
            cancellationToken);
    }
    
    private Guid GetCandidateId() {
        if (_currentUser.UserId is not Guid userId) {
            throw CvExceptions.InvalidAccessToken("A valid access token is required.");
        }
        
        if (!_currentUser.Roles.Contains(RoleNames.Candidate, StringComparer.OrdinalIgnoreCase)) {
            throw CvExceptions.CandidateRoleRequired("update");
        }
        
        return userId;
    }
}
