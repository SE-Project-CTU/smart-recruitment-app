using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Domain.Validation;

/// <summary>
/// Central CV field rules shared by application request validation and domain entities.
/// </summary>
public static class CvValidator {
    public const int MaximumTitleLength = 200;
    
    public static IReadOnlyList<CvValidationIssue> ValidateCreateRequest(
        Guid candidateId,
        Guid templateId,
        string? title,
        string? languageCode) {
        var issues = new List<CvValidationIssue>();
        var candidateIdIssue = ValidateCandidateId(candidateId);
        if (candidateIdIssue is not null) {
            issues.Add(candidateIdIssue);
        }

        var templateIdIssue = ValidateTemplateId(templateId);
        if (templateIdIssue is not null) {
            issues.Add(templateIdIssue);
        }
        
        var titleIssue = ValidateTitle(title);
        if (titleIssue is not null) {
            issues.Add(titleIssue);
        }
        
        var languageIssue = ValidateLanguageCode(languageCode);
        if (languageIssue is not null) {
            issues.Add(languageIssue);
        }
        
        return issues;
    }
    
    public static CvValidationIssue? ValidateCandidateId(Guid candidateId) {
        if (candidateId == Guid.Empty) {
            return new CvValidationIssue(
                "candidateId",
                CvValidationFailure.Required,
                "A candidate must be selected.");
        }
        
        return null;
    }
    
    public static CvValidationIssue? ValidateTemplateId(Guid templateId) {
        if (templateId == Guid.Empty) {
            return new CvValidationIssue(
                "templateId",
                CvValidationFailure.Required,
                "A template must be selected.");
        }
        
        return null;
    }
    
    public static CvValidationIssue? ValidateTitle(string? title) {
        if (string.IsNullOrWhiteSpace(title)) {
            return new CvValidationIssue(
                "title",
                CvValidationFailure.Required,
                "Title is required.");
        }
        
        if (title.Trim().Length > MaximumTitleLength) {
            return new CvValidationIssue(
                "title",
                CvValidationFailure.MaxLength,
                $"Title must not exceed {MaximumTitleLength} characters.");
        }
        
        return null;
    }
    
    public static CvValidationIssue? ValidateLanguageCode(string? languageCode) {
        if (languageCode is null) {
            return null;
        }
        
        var normalizedCode = languageCode.Trim();
        if (normalizedCode is "vi" or "en") {
            return null;
        }
        
        return new CvValidationIssue(
            "language",
            CvValidationFailure.InvalidFormat,
            "Language must be either 'vi' or 'en'.");
    }
    
    public static CvValidationIssue? ValidateLanguage(CvLanguage language) =>
        Enum.IsDefined(language)
            ? null
            : new CvValidationIssue(
                "language",
                CvValidationFailure.InvalidFormat,
                "CV language is invalid.");
    
    public static IReadOnlyList<CvValidationIssue> ValidateDocuments(
        CvContentDocument? content,
        CvLayoutDocument? layout,
        CvPresentationDocument? presentation) {
        var issues = new List<CvValidationIssue>();
        
        if (content is null) {
            issues.Add(new CvValidationIssue(
                "content",
                CvValidationFailure.Required,
                "CV content is required."));
        }
        
        if (layout is null) {
            issues.Add(new CvValidationIssue(
                "layout",
                CvValidationFailure.Required,
                "CV layout is required."));
        }
        
        if (presentation is null) {
            issues.Add(new CvValidationIssue(
                "presentation",
                CvValidationFailure.Required,
                "CV presentation is required."));
        }
        
        return issues;
    }
    
    public static CvLanguage ParseLanguageCode(string? languageCode) => languageCode?.Trim() switch {
        null => CvLanguage.Vietnamese,
        "vi" => CvLanguage.Vietnamese,
        "en" => CvLanguage.English,
        _ => throw new ArgumentException("Language code must be either 'vi' or 'en'.", nameof(languageCode))
    };
    
    public static string NormalizeTitle(string title) => title.Trim();
}
