using System.Text.RegularExpressions;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Rbac.Commands.CreatePermission;

public static class CreatePermissionCommandValidator {
    private static readonly Regex CodePattern = new(@"^[A-Z0-9_]{3,50}$", RegexOptions.Compiled);

    public static CreatePermissionCommand Validate(CreatePermissionCommand command) {
        var errors = new List<AppErrorDetail>();

        if (string.IsNullOrWhiteSpace(command.Code)) {
            errors.Add(new AppErrorDetail("code", ValidationReasons.Required, "Permission code is required."));
        } else {
            var trimmedCode = command.Code.Trim().ToUpperInvariant();
            if (!CodePattern.IsMatch(trimmedCode)) {
                errors.Add(new AppErrorDetail(
                    "code",
                    ValidationReasons.InvalidFormat,
                    "Permission code must be 3-50 uppercase alphanumeric characters or underscores (e.g. 'JOB_MODERATE')."));
            }
        }

        if (string.IsNullOrWhiteSpace(command.Name)) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Permission name is required."));
        } else if (command.Name.Trim().Length > 100) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.MaxLength, "Permission name cannot exceed 100 characters."));
        }

        if (string.IsNullOrWhiteSpace(command.Module)) {
            errors.Add(new AppErrorDetail("module", ValidationReasons.Required, "Permission module is required."));
        } else if (command.Module.Trim().Length > 50) {
            errors.Add(new AppErrorDetail("module", ValidationReasons.MaxLength, "Permission module cannot exceed 50 characters."));
        }

        if (command.Description is not null && command.Description.Trim().Length > 255) {
            errors.Add(new AppErrorDetail("description", ValidationReasons.MaxLength, "Permission description cannot exceed 255 characters."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Create permission validation failed.", errors);
        }

        return new CreatePermissionCommand(
            command.Code.Trim().ToUpperInvariant(),
            command.Name.Trim(),
            string.IsNullOrWhiteSpace(command.Description) ? null : command.Description.Trim(),
            command.Module.Trim()
        );
    }
}
