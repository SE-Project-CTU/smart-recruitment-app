using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Features.Account.UpdateCurrentAccount;

public sealed record ValidatedCurrentAccountUpdate(
    bool FullNameProvided,
    string? FullName,
    bool PhoneProvided,
    string? Phone);

public static class UpdateCurrentAccountValidator {
    public static ValidatedCurrentAccountUpdate ValidateAndNormalize(
        UpdateCurrentAccountCommand request) {
        var details = new List<AppErrorDetail>();
        
        if (!request.FullNameProvided &&
            !request.PhoneProvided &&
            !request.AvatarFileIdProvided) {
            details.Add(new AppErrorDetail(
                "body",
                ValidationReasons.Required,
                "At least one profile field must be provided."));
        }
        
        var fullName = request.FullNameProvided
            ? UserFieldValidator.ValidateFullName(request.FullName, details)
            : null;
        
        var phone = request.PhoneProvided
            ? UserFieldValidator.NormalizePhone(
                request.Phone,
                details,
                blankAsNull: false)
            : null;
        
        if (request.AvatarFileIdProvided &&
            request.AvatarFileId == Guid.Empty) {
            details.Add(new AppErrorDetail(
                "avatarFileId",
                ValidationReasons.InvalidFormat,
                "Avatar file id must be a valid non-empty UUID or null."));
        }
        
        if (details.Count > 0) {
            throw new AppException(
                AppErrorKind.Validation,
                CommonErrorCodes.ValidationError,
                "Request contains invalid fields.",
                details);
        }
        
        
        return new ValidatedCurrentAccountUpdate(
            request.FullNameProvided,
            fullName,
            request.PhoneProvided,
            phone);
    }
}