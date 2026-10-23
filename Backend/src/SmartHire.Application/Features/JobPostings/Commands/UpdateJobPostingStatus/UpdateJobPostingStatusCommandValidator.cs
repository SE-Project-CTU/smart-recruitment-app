using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Application.Features.JobPostings.Validation;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Commands.UpdateJobPostingStatus;

internal static class UpdateJobPostingStatusCommandValidator
{
    public static (Guid JobId, JobPostingStatus Status) Validate(UpdateJobPostingStatusCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.JobPostingId) ||
            !Guid.TryParse(command.JobPostingId, out var jobId))
        {
            throw JobPostingExceptions.InvalidJobPostingId();
        }

        var details = new List<AppErrorDetail>();

        var parsedStatus = JobPostingValidator.ParseApiEnum<JobPostingStatus>(
            command.Status,
            "status",
            details,
            required: true);

        // API 8 only allows changing status to CLOSED
        if (parsedStatus.HasValue && parsedStatus.Value != JobPostingStatus.Closed)
        {
            details.Add(new AppErrorDetail(
                "status",
                ValidationReasons.NotAllowed,
                $"Status '{command.Status}' is not allowed for this operation. Only 'CLOSED' is supported."));
        }

        if (details.Count > 0)
        {
            throw JobPostingExceptions.Validation(details);
        }

        return (jobId, parsedStatus!.Value);
    }
}
