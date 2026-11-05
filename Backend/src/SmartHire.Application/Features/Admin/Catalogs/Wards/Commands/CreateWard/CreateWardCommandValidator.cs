using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Wards.Commands.CreateWard;

public static class CreateWardCommandValidator {
    public static CreateWardCommand Validate(CreateWardCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.ProvinceId == Guid.Empty) {
            errors.Add(new AppErrorDetail("provinceId", ValidationReasons.Required, "Province ID is required."));
        }

        if (string.IsNullOrWhiteSpace(command.Name)) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Ward name is required."));
        } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Ward name must be between 2 and 150 characters."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Create ward validation failed.", errors);
        }

        return command with { Name = command.Name.Trim() };
    }
}

