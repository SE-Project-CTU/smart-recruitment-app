using System.Text.RegularExpressions;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Commands.CreateCvTemplate;

public static class CreateCvTemplateCommandValidator {
    private static readonly Regex CodePattern = new(@"^[a-z0-9]+(-[a-z0-9]+)*$", RegexOptions.Compiled);

    public static CreateCvTemplateCommand Validate(CreateCvTemplateCommand command) {
        var errors = new List<AppErrorDetail>();

        if (string.IsNullOrWhiteSpace(command.Code)) {
            errors.Add(new AppErrorDetail("code", ValidationReasons.Required, "Template code is required."));
        } else {
            var trimmedCode = command.Code.Trim().ToLowerInvariant();
            if (!CodePattern.IsMatch(trimmedCode)) {
                errors.Add(new AppErrorDetail(
                    "code",
                    ValidationReasons.InvalidFormat,
                    "Template code must be lowercase alphanumeric with hyphens (kebab-case, e.g. 'modern-blue')."));
            }
        }

        if (string.IsNullOrWhiteSpace(command.Name)) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.Required, "Template name is required."));
        } else if (command.Name.Trim().Length < 2 || command.Name.Trim().Length > 150) {
            errors.Add(new AppErrorDetail("name", ValidationReasons.InvalidFormat, "Template name must be between 2 and 150 characters."));
        }

        if (command.ThumbnailFileId == Guid.Empty) {
            errors.Add(new AppErrorDetail("thumbnailFileId", ValidationReasons.Required, "Thumbnail file ID is required."));
        }

        if (command.DefaultLayout is null) {
            errors.Add(new AppErrorDetail("defaultLayout", ValidationReasons.Required, "Default layout document is required."));
        }

        if (command.DefaultContent is null) {
            errors.Add(new AppErrorDetail("defaultContent", ValidationReasons.Required, "Default content document is required."));
        }

        if (errors.Count > 0) {
            throw AdminExceptions.Validation("Create CV template validation failed.", errors);
        }

        return command with {
            Code = command.Code.Trim().ToLowerInvariant(),
            Name = command.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(command.Description) ? null : command.Description.Trim(),
            Version = string.IsNullOrWhiteSpace(command.Version) ? "1" : command.Version.Trim()
        };
    }
}

