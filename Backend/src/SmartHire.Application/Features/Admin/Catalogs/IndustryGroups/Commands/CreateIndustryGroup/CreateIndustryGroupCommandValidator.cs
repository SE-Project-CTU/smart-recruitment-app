using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.IndustryGroups.Commands.CreateIndustryGroup;

public static class CreateIndustryGroupCommandValidator {
    public static CreateIndustryGroupCommand Validate(CreateIndustryGroupCommand command) {
        var errors = new List<AppErrorDetail>();

        if (string.IsNullOrWhiteSpace(command.Name)) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Industry group name is required."));
        } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Industry group name must be between 2 and 150 characters."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Create industry group validation failed.", errors);
        }

        return command with { Name = command.Name.Trim() };
    }
}

