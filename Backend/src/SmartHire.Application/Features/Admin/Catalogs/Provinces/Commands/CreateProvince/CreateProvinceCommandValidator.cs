using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Provinces.Commands.CreateProvince;

public static class CreateProvinceCommandValidator {
    public static CreateProvinceCommand Validate(CreateProvinceCommand command) {
        var errors = new List<AppErrorDetail>();

        if (string.IsNullOrWhiteSpace(command.Name)) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Province name is required."));
        } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Province name must be between 2 and 150 characters."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Create province validation failed.", errors);
        }

        return command with { Name = command.Name.Trim() };
    }
}

