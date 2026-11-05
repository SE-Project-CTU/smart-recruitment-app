using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Industries.Commands.UpdateIndustry;

public static class UpdateIndustryCommandValidator {
    public static UpdateIndustryCommand Validate(UpdateIndustryCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.Id == Guid.Empty) {
            errors.Add(new AppErrorDetail("id", ValidationReasons.Required, "Industry ID is required."));
        }

        if (command.GroupId.HasValue && command.GroupId.Value == Guid.Empty) {
            errors.Add(new AppErrorDetail("groupId", ValidationReasons.NotAllowed, "Group ID cannot be empty GUID."));
        }

        if (command.Name is not null) {
            if (string.IsNullOrWhiteSpace(command.Name)) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Industry name cannot be empty."));
            } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Industry name must be between 2 and 150 characters."));
            }
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Update industry validation failed.", errors);
        }

        return command with { Name = command.Name?.Trim() };
    }
}

