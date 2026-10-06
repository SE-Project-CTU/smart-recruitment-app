using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Auth.RegisterCandidate;

public static partial class RegisterCandidateCommandValidator {
    private const int EmailMaxLength = 254;
    private const int PasswordMinLength = 8;
    private const int FullNameMinLength = 2;
    private const int FullNameMaxLength = 100;
    
    [GeneratedRegex(@"^(?:\+?84|0)[3|5|7|8|9]\d{8}$", RegexOptions.CultureInvariant)]
    private static partial Regex FlexibleVietnamPhoneRegex();
    
    public static RegisterCandidateCommand ValidateAndNormalize(
        RegisterCandidateCommand request) {
        var details = new List<AppErrorDetail>();
        
        var email = request.Email?.Trim().ToLowerInvariant();
        var phone = string.IsNullOrWhiteSpace(request.Phone)
            ? null
            : request.Phone.Trim();
        var password = request.Password;
        var fullName = request.FullName?.Trim();
        
        if (string.IsNullOrWhiteSpace(email)) {
            details.Add(new AppErrorDetail(
                "email", ValidationReasons.Required, "Email is required."));
        }
        else {
            if (email.Length > EmailMaxLength) {
                details.Add(new AppErrorDetail(
                    $"email", ValidationReasons.MaxLength, $"Email must not exceed {EmailMaxLength} characters."));
            }
            
            if (!new EmailAddressAttribute().IsValid(email)) {
                details.Add(new AppErrorDetail(
                    "email", ValidationReasons.InvalidFormat, "Email format is invalid."));
            }
        }
        
        if (phone is not null && !FlexibleVietnamPhoneRegex().IsMatch(phone)) {
            details.Add(new AppErrorDetail(
                "phone",
                ValidationReasons.InvalidFormat,
                "Invalid Vietnamese phone number format. Must start with '0' or '+84' followed by 9 digits."));
        }
        
        if (string.IsNullOrWhiteSpace(password)) {
            details.Add(new AppErrorDetail(
                "password", ValidationReasons.Required, "Password is required."));
        }
        else if (password.Length < PasswordMinLength) {
            details.Add(new AppErrorDetail(
                $"password", ValidationReasons.MinLength,
                $"Password must contain at least {PasswordMinLength} characters."));
        }
        
        if (string.IsNullOrWhiteSpace(fullName)) {
            details.Add(new AppErrorDetail(
                "fullName", ValidationReasons.Required, "Full name is required."));
        }
        else {
            if (fullName.Length < FullNameMinLength) {
                details.Add(new AppErrorDetail(
                    $"fullName", ValidationReasons.MaxLength,
                    $"Full name must contain at least {FullNameMinLength} characters."));
            }
            
            if (fullName.Length > FullNameMaxLength) {
                details.Add(new AppErrorDetail(
                    $"fullName", ValidationReasons.MaxLength,
                    $"Full name must not exceed {FullNameMaxLength} characters."));
            }
        }
        
        if (details.Count > 0) {
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "Request contains invalid fields.",
                details);
        }
        
        return request with {
            Email = email!,
            Phone = phone,
            FullName = fullName!
        };
    }
}