using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Commands.UpdateIndustryGroup;

public static class UpdateIndustryGroupCommandValidator {
    public static UpdateIndustryGroupCommand Validate(UpdateIndustryGroupCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.Id == Guid.Empty) {
            errors.Add(new AppErrorDetail("id", ValidationReasons.Required, "Industry group ID is required."));
        }

        if (command.Name is not null) {
            if (string.IsNullOrWhiteSpace(command.Name)) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Industry group name cannot be empty."));
            } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Industry group name must be between 2 and 150 characters."));
            }
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Update industry group validation failed.", errors);
        }

        return command with { Name = command.Name?.Trim() };
    }
}

