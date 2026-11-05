using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Commands.UpdateCvTemplate;

public static class UpdateCvTemplateCommandValidator {
    public static UpdateCvTemplateCommand Validate(UpdateCvTemplateCommand command) {
        var errors = new List<AppErrorDetail>();

        if (command.Id == Guid.Empty) {
            errors.Add(new AppErrorDetail("id", ValidationReasons.Required, "CV template ID is required."));
        }

        if (command.Name is not null) {
            if (string.IsNullOrWhiteSpace(command.Name)) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Template name cannot be empty."));
            } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
                errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Template name must be between 2 and 150 characters."));
            }
        }

        if (command.ThumbnailFileId.HasValue && command.ThumbnailFileId.Value == Guid.Empty) {
            errors.Add(new AppErrorDetail("thumbnailFileId", ValidationReasons.NotAllowed, "Thumbnail file ID cannot be empty GUID."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Update CV template validation failed.", errors);
        }

        return command with {
            Name = command.Name?.Trim(),
            Description = command.Description is not null && string.IsNullOrWhiteSpace(command.Description)
                ? null
                : command.Description?.Trim(),
            Version = command.Version?.Trim()
        };
    }
}

