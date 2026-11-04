using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Wards.Commands.UpdateWard;

public static class UpdateWardCommandValidator {
    public static UpdateWardCommand Validate(UpdateWardCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.Id == Guid.Empty) {
            errors.Add(new AppErrorDetail("id", ValidationReasons.Required, "Ward ID is required."));
        }

        if (command.ProvinceId.HasValue && command.ProvinceId.Value == Guid.Empty) {
            errors.Add(new AppErrorDetail("provinceId", ValidationReasons.NotAllowed, "Province ID cannot be empty GUID."));
        }

        if (command.Name is not null) {
            if (string.IsNullOrWhiteSpace(command.Name)) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Ward name cannot be empty."));
            } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Ward name must be between 2 and 150 characters."));
            }
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Update ward validation failed.", errors);
        }

        return command with { Name = command.Name?.Trim() };
    }
}

