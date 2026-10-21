using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Applications.Commands.ApplyToJobPosting;

internal static class ApplyToJobPostingCommandValidator {
    private const int MaximumCoverLetterLength = 10_000;
    
    public static Guid Validate(ApplyToJobPostingCommand command) {
        if (!Guid.TryParse(command.JobPostingId, out var jobPostingId) || jobPostingId == Guid.Empty) {
            throw new AppException(
                AppErrorKind.BadRequest,
                "INVALID_JOB_POSTING_ID",
                "Job posting ID has an invalid format.",
                [
                    new AppErrorDetail("id", ValidationReasons.InvalidFormat,
                        "The id path parameter must be a valid UUID.")
                ]);
        }
        
        var details = new List<AppErrorDetail>();
        if (command.CvVersionId.HasValue == command.UploadedCvFileId.HasValue) {
            details.AddRange(
                new AppErrorDetail(
                    "cvVersionId",
                    ValidationReasons.Required,
                    "Provide exactly one of cvVersionId or uploadedCvFileId."),
                new AppErrorDetail(
                    "uploadedCvFileId",
                    ValidationReasons.Required,
                    "Provide exactly one of cvVersionId or uploadedCvFileId.")
            );
        }
        
        if (command.CvVersionId == Guid.Empty) {
            details.Add(new AppErrorDetail("cvVersionId", ValidationReasons.InvalidFormat,
                "CV version ID cannot be an empty UUID."));
        }
        
        if (command.UploadedCvFileId == Guid.Empty) {
            details.Add(new AppErrorDetail("uploadedCvFileId", ValidationReasons.InvalidFormat,
                "Uploaded CV file ID cannot be an empty UUID."));
        }
        
        if (command.CoverLetter?.Length > MaximumCoverLetterLength) {
            details.Add(new AppErrorDetail("coverLetter", ValidationReasons.MaxLength,
                $"Cover letter must not exceed {MaximumCoverLetterLength} characters."));
        }
        
        if (details.Count > 0) {
            throw new AppException(
                AppErrorKind.Validation,
                "INVALID_APPLICATION",
                "Application request contains invalid fields.",
                details);
        }
        
        return jobPostingId;
    }
}