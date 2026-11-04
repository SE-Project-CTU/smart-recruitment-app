using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Rbac.Commands.AssignRolePermissions;

public static class AssignRolePermissionsCommandValidator {
    public static AssignRolePermissionsCommand Validate(AssignRolePermissionsCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.RoleId == Guid.Empty) {
            errors.Add(new AppErrorDetail("roleId", ValidationReasons.Required, "Role ID is required."));
        }

        if (command.PermissionIds is null) {
            errors.Add(new AppErrorDetail("permissionIds", ValidationReasons.Required, "Permission IDs list cannot be null."));
        } else if (command.PermissionIds.Any(id => id == Guid.Empty)) {
            errors.Add(new AppErrorDetail("permissionIds", ValidationReasons.NotAllowed, "Permission IDs must not contain empty GUIDs."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Assign role permissions validation failed.", errors);
        }

        return command with {
            PermissionIds = command.PermissionIds!.Distinct().ToList()
        };
    }
}
