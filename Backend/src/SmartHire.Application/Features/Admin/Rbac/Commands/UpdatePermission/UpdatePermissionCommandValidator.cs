using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Rbac.Commands.UpdatePermission;

public static class UpdatePermissionCommandValidator {
    public static UpdatePermissionCommand Validate(UpdatePermissionCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.Id == Guid.Empty) {
            errors.Add(new AppErrorDetail("id", ValidationReasons.Required, "Permission ID is required."));
        }

        if (command.Name is not null) {
            if (string.IsNullOrWhiteSpace(command.Name)) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Permission name cannot be empty."));
            } else if (command.Name.Trim().Length > 100) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.MaxLength, "Permission name cannot exceed 100 characters."));
            }
        }

        if (command.Module is not null) {
            if (string.IsNullOrWhiteSpace(command.Module)) {
                errors.Add(new AppErrorDetail("module", ValidationReasons.Required, "Permission module cannot be empty."));
            } else if (command.Module.Trim().Length > 50) {
                errors.Add(new AppErrorDetail("module", ValidationReasons.MaxLength, "Permission module cannot exceed 50 characters."));
            }
        }

        if (command.Description is not null && command.Description.Trim().Length > 255) {
            errors.Add(new AppErrorDetail("description", ValidationReasons.MaxLength, "Permission description cannot exceed 255 characters."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Update permission validation failed.", errors);
        }

        return command with {
            Name = command.Name?.Trim(),
            Description = command.Description is not null && string.IsNullOrWhiteSpace(command.Description)
                ? null
                : command.Description?.Trim(),
            Module = command.Module?.Trim()
        };
    }
}

