using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Common.Validation;

/// <summary>
/// Shared normalization and validation rules for user profile fields.
/// Callers decide whether a field is required or whether an empty value has
/// special meaning for their particular request.
/// </summary>
public static partial class UserFieldValidator
{
    public const int FullNameMinLength = 2;
    public const int FullNameMaxLength = 100;
    public const int EmailMaxLength = 254;
    public const int NewPasswordMinLength = 8;

    public static string? NormalizeEmail(
        string? input,
        ICollection<AppErrorDetail> details,
        string fieldName = "email")
    {
        var email = input?.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(email))
        {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.Required,
                "Email is required."));
            return null;
        }

        if (email.Length > EmailMaxLength)
        {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.MaxLength,
                $"Email must not exceed {EmailMaxLength} characters."));
        }

        if (!new EmailAddressAttribute().IsValid(email))
        {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.InvalidFormat,
                "Email format is invalid."));
        }

        return email;
    }

    /// <summary>
    /// Validates a password without modifying it. Pass minimumLength: null for
    /// existing passwords (such as login) when only a non-empty value is required.
    /// </summary>
    public static string? ValidatePassword(
        string? input,
        ICollection<AppErrorDetail> details,
        int? minimumLength = NewPasswordMinLength,
        string fieldName = "password")
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.Required,
                "Password is required."));
            return null;
        }

        if (minimumLength is int min && input.Length < min)
        {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.MinLength,
                $"Password must contain at least {min} characters."));
        }

        // Passwords are intentionally not trimmed or normalized.
        return input;
    }

    [GeneratedRegex(@"^(?:\+?84|0)[35789]\d{8}$", RegexOptions.CultureInvariant)]
    private static partial Regex FlexibleVietnamPhoneRegex();

    public static string? ValidateFullName(
        string? input,
        ICollection<AppErrorDetail> details,
        string fieldName = "fullName")
    {
        var fullName = input?.Trim();

        if (string.IsNullOrWhiteSpace(fullName))
        {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.Required,
                "Full name is required."));

            return null;
        }

        if (fullName.Length < FullNameMinLength)
        {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.MinLength,
                $"Full name must contain at least {FullNameMinLength} characters."));
        }

        if (fullName.Length > FullNameMaxLength)
        {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.MaxLength,
                $"Full name must not exceed {FullNameMaxLength} characters."));
        }

        return fullName;
    }

    /// <summary>
    /// Validates a Vietnamese phone number and normalizes it to +84 format.
    /// A null input remains null. When blankAsNull is true, whitespace also
    /// becomes null; PATCH callers should pass false so only JSON null clears it.
    /// </summary>
    public static string? NormalizePhone(
        string? input,
        ICollection<AppErrorDetail> details,
        bool blankAsNull = true,
        string fieldName = "phone")
    {
        if (input is null)
        {
            return null;
        }

        var phone = input.Trim();
        if (phone.Length == 0)
        {
            if (blankAsNull)
            {
                return null;
            }

            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.Required,
                "Phone must be null to clear it, or contain a valid phone number."));

            return null;
        }

        if (!FlexibleVietnamPhoneRegex().IsMatch(phone))
        {
            details.Add(new AppErrorDetail(
                fieldName,
                ValidationReasons.InvalidFormat,
                "Invalid Vietnamese phone number format. Use 0xxxxxxxxx or +84xxxxxxxxx."));

            return null;
        }

        if (phone.StartsWith('0'))
        {
            return $"+84{phone[1..]}";
        }

        if (phone.StartsWith("84", StringComparison.Ordinal))
        {
            return $"+{phone}";
        }

        return phone;
    }
}
