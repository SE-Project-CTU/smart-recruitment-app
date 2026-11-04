using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.JobPostings.Commands.ReviewJobModeration;

public static class ReviewJobModerationCommandValidator {
    public static ReviewJobModerationCommand Validate(ReviewJobModerationCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.JobPostingId == Guid.Empty) {
            errors.Add(new AppErrorDetail("jobPostingId", ValidationReasons.Required, "Job posting ID is required."));
        }

        if (command.Status != JobPostingStatus.Published && command.Status != JobPostingStatus.Rejected) {
            errors.Add(new AppErrorDetail(
                "status",
                ValidationReasons.NotAllowed,
                $"Status must be either '{JobPostingStatus.Published}' or '{JobPostingStatus.Rejected}'."));
        }

        if (command.Status == JobPostingStatus.Rejected && string.IsNullOrWhiteSpace(command.RejectionReason)) {
            errors.Add(new AppErrorDetail(
                "rejectionReason",
                ValidationReasons.Required,
                "Rejection reason is required when rejecting a job posting."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Job posting moderation validation failed.", errors);
        }

        return command with {
            RejectionReason = string.IsNullOrWhiteSpace(command.RejectionReason) ? null : command.RejectionReason.Trim()
        };
    }
}
