using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Users.Commands.UpdateUserStatus;

public static class UpdateUserStatusCommandValidator {
    public const int ReasonMinLength = 5;
    public const int ReasonMaxLength = 1000;

    public static UpdateUserStatusCommand Validate(UpdateUserStatusCommand command) {
        var details = new List<AppErrorDetail>();

        if (command.UserId == Guid.Empty) {
            details.Add(new AppErrorDetail("userId", ValidationReasons.InvalidFormat, "User ID must be a valid non-empty UUID."));
        }

        if (command.Status != UserStatus.Active && command.Status != UserStatus.Locked && command.Status != UserStatus.Inactive) {
            details.Add(new AppErrorDetail("status", ValidationReasons.InvalidFormat, "Status must be Active, Locked, or Inactive."));
        }

        if (command.Status == UserStatus.Locked) {
            if (string.IsNullOrWhiteSpace(command.Reason)) {
                details.Add(new AppErrorDetail("reason", ValidationReasons.Required, "Reason is required when locking a user account."));
            } else {
                var trimmed = command.Reason.Trim();
                if (trimmed.Length < ReasonMinLength) {
                    details.Add(new AppErrorDetail("reason", ValidationReasons.MinLength, $"Reason must be at least {ReasonMinLength} characters."));
                } else if (trimmed.Length > ReasonMaxLength) {
                    details.Add(new AppErrorDetail("reason", ValidationReasons.MaxLength, $"Reason must not exceed {ReasonMaxLength} characters."));
                }
            }
        }

        if (details.Count > 0) {
            throw AdminExceptions.Validation("Request contains invalid fields.", details);
        }

        return command with {
            Reason = command.Reason?.Trim()
        };
    }
}
