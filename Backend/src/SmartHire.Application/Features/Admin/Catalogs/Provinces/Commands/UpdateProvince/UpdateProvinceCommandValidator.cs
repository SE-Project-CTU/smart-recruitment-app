using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Provinces.Commands.UpdateProvince;

public static class UpdateProvinceCommandValidator {
    public static UpdateProvinceCommand Validate(UpdateProvinceCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.Id == Guid.Empty) {
            errors.Add(new AppErrorDetail("id", ValidationReasons.Required, "Province ID is required."));
        }

        if (command.Name is not null) {
            if (string.IsNullOrWhiteSpace(command.Name)) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Province name cannot be empty."));
            } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Province name must be between 2 and 150 characters."));
            }
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Update province validation failed.", errors);
        }

        return command with { Name = command.Name?.Trim() };
    }
}

