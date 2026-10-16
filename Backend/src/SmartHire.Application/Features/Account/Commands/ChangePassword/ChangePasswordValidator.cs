using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Features.Account.ChangePassword;

public sealed record ValidatedChangePassword(
    string CurrentPassword,
    string NewPassword);

public static class ChangePasswordValidator
{
    public static ValidatedChangePassword ValidateAndNormalize(
        string? currentPassword,
        string? newPassword)
    {
        var details = new List<AppErrorDetail>();

        var current = UserFieldValidator.ValidatePassword(
            currentPassword,
            details,
            minimumLength: null,
            fieldName: "currentPassword");

        var next = UserFieldValidator.ValidatePassword(
            newPassword,
            details,
            fieldName: "newPassword");

        if (details.Count > 0)
        {
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "Request contains invalid fields.",
                details);
        }

        return new ValidatedChangePassword(current!, next!);
    }
}
