using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Skills.Commands.UpdateSkill;

public static class UpdateSkillCommandValidator {
    public static UpdateSkillCommand Validate(UpdateSkillCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.Id == Guid.Empty) {
            errors.Add(new AppErrorDetail("id", ValidationReasons.Required, "Skill ID is required."));
        }

        if (command.Name is not null) {
            if (string.IsNullOrWhiteSpace(command.Name)) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Skill name cannot be empty."));
            } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 100) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Skill name must be between 2 and 100 characters."));
            }
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Update skill validation failed.", errors);
        }

        return command with { Name = command.Name?.Trim() };
    }
}

