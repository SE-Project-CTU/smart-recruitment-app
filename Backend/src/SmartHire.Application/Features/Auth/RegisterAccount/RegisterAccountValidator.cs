using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Features.Auth.RegisterAccount;

public sealed record ValidatedRegisterAccount(
    string Email,
    string? Phone,
    string Password,
    string FullName
);

public static class RegisterAccountValidator {
    public static ValidatedRegisterAccount ValidateAndNormalize(
        string? emailInput,
        string? phoneInput,
        string? password,
        string? fullNameInput
    ) {
        var details = new List<AppErrorDetail>();
        var email = UserFieldValidator.NormalizeEmail(emailInput, details);
        var phone = UserFieldValidator.NormalizePhone(phoneInput, details);
        var fullName = UserFieldValidator.ValidateFullName(fullNameInput, details);
        var validatedPassword = UserFieldValidator.ValidatePassword(password, details);

        if (details.Count > 0) {
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "Request contains invalid fields.",
                details);
        }

        return new ValidatedRegisterAccount(
            email!,
            phone,
            validatedPassword!,
            fullName!);
    }
}
