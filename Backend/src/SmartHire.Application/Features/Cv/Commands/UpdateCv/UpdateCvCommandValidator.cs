using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;
using SmartHire.Domain.Validation;

namespace SmartHire.Application.Features.Cv.Commands.UpdateCv;

public sealed record ValidatedUpdateCvCommand(
    Guid Id,
    bool TitleProvided,
    string? Title,
    bool ContentProvided,
    CvContentDocument? Content,
    bool LayoutProvided,
    CvLayoutDocument? Layout,
    bool PresentationProvided,
    CvPresentationDocument? Presentation,
    bool LanguageProvided,
    string? Language,
    bool? IsPublic,
    bool IsPublicProvided,
    CvLanguage? ParsedLanguage
);

public static class UpdateCvCommandValidator {
    private const int MaximumTitleLength = 150;
    
    public static ValidatedUpdateCvCommand Validate(UpdateCvCommand command) {
        var details = new List<AppErrorDetail>();
        
        if (command.Id == Guid.Empty) {
            details.Add(new AppErrorDetail("id", ValidationReasons.InvalidFormat,
                "Provide a non-empty CV id."));
        }
        
        if (!command.TitleProvided && !command.IsPublicProvided &&
            !command.ContentProvided && !command.LayoutProvided &&
            !command.PresentationProvided && !command.LanguageProvided) {
            details.Add(new AppErrorDetail("body", ValidationReasons.Required,
                "Provide at least one field to update."));
        }
        
        var title = command.Title?.Trim();
        if (command.TitleProvided) {
            if (string.IsNullOrWhiteSpace(title)) {
                details.Add(new AppErrorDetail("title", ValidationReasons.Required,
                    "Title cannot be empty."));
            }
            else if (title.Length > MaximumTitleLength) {
                details.Add(new AppErrorDetail("title", ValidationReasons.MaxLength,
                    $"Title must not exceed {MaximumTitleLength} characters."));
            }
        }
        
        if (command.IsPublicProvided && command.IsPublic is not null) {
            details.Add(new AppErrorDetail("isPublic", ValidationReasons.Required,
                "Is public cannot be null."));
        }
        
        if (command.ContentProvided && command.Content is null) {
            details.Add(new AppErrorDetail("content", ValidationReasons.Required,
                "Content cannot be null."));
        }
        
        if (command.LayoutProvided && command.Layout is null) {
            details.Add(new AppErrorDetail("layout", ValidationReasons.Required,
                "Layout cannot be null."));
        }
        
        if (command.PresentationProvided && command.Presentation is null) {
            details.Add(new AppErrorDetail("presentation", ValidationReasons.Required,
                "Presentation cannot be null."));
        }
        
        CvLanguage? parsedLanguage = null;
        var language = command.Language?.Trim().ToLowerInvariant();
        if (command.LanguageProvided) {
            if (string.IsNullOrWhiteSpace(language)) {
                details.Add(new AppErrorDetail("language", ValidationReasons.Required,
                    "Language cannot be empty."));
            }
            else {
                var issue = CvValidator.ValidateLanguageCode(language);
                if (issue is not null) {
                    details.Add(new AppErrorDetail("language", ValidationReasons.InvalidFormat,
                        issue.Message));
                }
                else {
                    parsedLanguage = CvValidator.ParseLanguageCode(language);
                }
            }
        }
        
        foreach (var fieldName in command.AdditionalFieldNames) {
            details.Add(new AppErrorDetail(fieldName, ValidationReasons.NotAllowed,
                $"Field '{fieldName}' cannot be updated by this endpoint."));
        }
        
        if (details.Count > 0) {
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "CV update request contains invalid fields.",
                details);
        }
        
        return new ValidatedUpdateCvCommand(
            command.Id,
            command.TitleProvided,
            title,
            command.ContentProvided,
            command.Content,
            command.LayoutProvided,
            command.Layout,
            command.PresentationProvided,
            command.Presentation,
            command.LanguageProvided,
            language,
            command.IsPublic,
            command.IsPublicProvided,
            parsedLanguage
        );
    }
}