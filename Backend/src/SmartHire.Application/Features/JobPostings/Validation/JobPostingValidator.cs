using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Features.JobPostings.Validation;

/// <summary>
/// Shared validation helpers used by Job Posting commands and queries.
/// </summary>
internal static class JobPostingValidator
{
    public static TEnum? ParseApiEnum<TEnum>(
        string? value,
        string field,
        ICollection<AppErrorDetail> details,
        bool required = false)
        where TEnum : struct, Enum
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            if (required)
                details.Add(Invalid(field, $"{field} contains an unsupported value."));

            return null;
        }

        var normalized = value.Trim()
            .Replace("_", string.Empty)
            .Replace("-", string.Empty)
            .Replace(" ", string.Empty);

        var isNamedValue = Enum.GetNames<TEnum>()
            .Any(name => name.Equals(normalized, StringComparison.OrdinalIgnoreCase));

        if (isNamedValue &&
            Enum.TryParse<TEnum>(normalized, true, out var parsed) &&
            Enum.IsDefined(parsed))
            return parsed;

        details.Add(Invalid(field, $"{field} contains an unsupported value."));
        return null;
    }

    public static AppErrorDetail Invalid(string field, string message) =>
        new(field, ValidationReasons.InvalidFormat, message);
}
