using SmartHire.Application.Common.Errors;
using SmartHire.Domain.Validation;
using SmartHire.Application.Features.Cv.Exceptions;

namespace SmartHire.Application.Features.Cv.Commands.CreateCv;

public static class CreateCvCommandValidator {
    public static CreateCvCommand Validate(CreateCvCommand command, Guid candidateId) {
        var title = command.Title?.Trim();
        var language = command.Language?.Trim();
        
        var issues = CvValidator.ValidateCreateRequest(
            candidateId,
            command.TemplateId,
            title,
            language);
        
        if (issues.Count > 0) {
            throw CvExceptions.Validation(
                "CV request contains invalid fields.",
                issues.Select(issue => new AppErrorDetail(
                    issue.Field,
                    ToValidationReason(issue.Failure),
                    issue.Message)));
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
