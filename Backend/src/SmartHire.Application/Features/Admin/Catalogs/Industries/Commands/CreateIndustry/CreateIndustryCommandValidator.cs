using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Industries.Commands.CreateIndustry;

public static class CreateIndustryCommandValidator {
    public static CreateIndustryCommand Validate(CreateIndustryCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.GroupId == Guid.Empty) {
            errors.Add(new AppErrorDetail("groupId", ValidationReasons.Required, "Industry group ID is required."));
        }

        if (string.IsNullOrWhiteSpace(command.Name)) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Industry name is required."));
        } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Industry name must be between 2 and 150 characters."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Create industry validation failed.", errors);
        }

        return command with { Name = command.Name.Trim() };
    }
}

