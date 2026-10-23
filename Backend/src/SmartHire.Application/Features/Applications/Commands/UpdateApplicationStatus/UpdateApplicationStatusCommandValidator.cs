using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Commands.UpdateApplicationStatus;

internal static class UpdateApplicationStatusCommandValidator {
    private const int MaximumNoteLength = 2_000;

    public static ValidatedUpdateApplicationStatusCommand Validate(UpdateApplicationStatusCommand command) {
        var details = new List<AppErrorDetail>();
        ApplicationStatus? status = null;

        if (string.IsNullOrWhiteSpace(command.Status)) {
            details.Add(new AppErrorDetail("status", ValidationReasons.Required, "Status is required."));
        }
        else if (ApplicationStatusContract.TryParseUpdateTarget(command.Status, out var parsedStatus)) {
            status = parsedStatus;
        }
        else {
            details.Add(new AppErrorDetail("status", ValidationReasons.InvalidFormat,
                "Status must be 'REVIEWING', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED', or 'WITHDRAWN'."));
        }

        if (command.Note?.Length > MaximumNoteLength) {
            details.Add(new AppErrorDetail("note", ValidationReasons.MaxLength,
                $"Note must not exceed {MaximumNoteLength} characters."));
        }

        if (details.Count > 0) throw ApplicationExceptions.InvalidRequest(details);

        return new ValidatedUpdateApplicationStatusCommand(
            command.ApplicationId,
            status!.Value,
            command.Note);
    }
}
