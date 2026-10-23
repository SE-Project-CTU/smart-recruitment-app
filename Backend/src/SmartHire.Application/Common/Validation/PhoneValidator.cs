using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Common.Validation;

public static class PhoneValidator {
    public const int MinLength = 10;
    public const int MaxLength = 11;
    
    public static string? Validate(
        string? phone,
        ICollection<AppErrorDetail> details,
        bool isRequired = true,
        string fieldName = "phone",
        string emptyMessage = "Phone is required.") {
        
        var trimmed = phone?.Trim();

        if (string.IsNullOrWhiteSpace(trimmed)) {
            if (isRequired) {
                details.Add(new AppErrorDetail(fieldName, ValidationReasons.Required, emptyMessage));
            }
            return null;
        }

        if (trimmed.Length < MinLength || trimmed.Length > MaxLength) {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.InvalidFormat,
                $"Phone must be between {MinLength} and {MaxLength} digits."));
            return null;
        }

        if (!trimmed.All(char.IsAsciiDigit)) {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.InvalidFormat,
                "Phone must contain only digits."));
            return null;
        }

        return trimmed;
    }
}