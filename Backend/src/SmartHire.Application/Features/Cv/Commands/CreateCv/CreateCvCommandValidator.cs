using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Domain.Validation;

namespace SmartHire.Application.Features.Cv.Commands.CreateCv;

public static class CreateCvCommandValidator {
    public static CreateCvCommand Validate(CreateCvCommand command, Guid candidateId) {
        var title = command.Title?.Trim();
        var language = command.Language?.Trim();
        
        var issues = new List<CvValidationIssue>();
        
        issues.Add(CvValidator.ValidateCandidateId(candidateId));
        issues.Add(CvValidator.ValidateTemplateId(command.TemplateId));
        
        var titleIssue = CvValidator.ValidateTitle(title);
        if (titleIssue is not null) {
            issues.Add(titleIssue);
        }
        
        var languageIssue = CvValidator.ValidateLanguageCode(language);
        if (languageIssue is not null) {
            issues.Add(languageIssue);
        }
        
        if (issues.Count > 0) {
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "CV request contains invalid fields.",
                issues.Select(issue => new AppErrorDetail(
                    issue.Field,
                    ToValidationReason(issue.Failure),
                    issue.Message)).ToArray());
        }
        
        return command with {
            Title = title,
            Language = language
        };
    }
    
    private static string ToValidationReason(CvValidationFailure failure) => failure switch {
        CvValidationFailure.Required => ValidationReasons.Required,
        CvValidationFailure.MaxLength => ValidationReasons.MaxLength,
        CvValidationFailure.InvalidFormat => ValidationReasons.InvalidFormat,
        _ => throw new ArgumentOutOfRangeException(nameof(failure), failure, null)
    };
}