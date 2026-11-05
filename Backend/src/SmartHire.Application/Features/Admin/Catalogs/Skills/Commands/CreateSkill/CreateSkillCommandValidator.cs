using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.Skills.Commands.CreateSkill;

public static class CreateSkillCommandValidator {
    public static CreateSkillCommand Validate(CreateSkillCommand command) {
        var errors = new List<AppErrorDetail>();

        if (string.IsNullOrWhiteSpace(command.Name)) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Skill name is required."));
        } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 100) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Skill name must be between 2 and 100 characters."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Create skill validation failed.", errors);
        }

        return command with { Name = command.Name.Trim() };
    }
}

