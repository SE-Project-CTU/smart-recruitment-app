using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Admin.Exceptions;

public static class AdminExceptions {
    public static AppException UserNotFound(Guid userId) => new(
        AppErrorKind.NotFound,
        AdminErrorCodes.UserNotFound,
        "User not found.",
        [new AppErrorDetail("userId", ErrorDetailReasons.NotFound, $"User with ID '{userId}' does not exist.")]);

    public static AppException CannotLockLastAdmin() => new(
        AppErrorKind.Conflict,
        AdminErrorCodes.CannotLockLastAdmin,
        "Cannot lock the last active Admin user.",
        [new AppErrorDetail("userId", ValidationReasons.NotAllowed, "At least one active Admin must remain in the system.")]);

    public static AppException CompanyNotFound(Guid companyId) => new(
        AppErrorKind.NotFound,
        AdminErrorCodes.CompanyNotFound,
        "Company not found.",
        [new AppErrorDetail("companyId", ErrorDetailReasons.NotFound, $"Company with ID '{companyId}' does not exist.")]);

    public static AppException Validation(string message, IEnumerable<AppErrorDetail>? details = null) => new(
        AppErrorKind.Validation,
        CommonErrorCodes.ValidationError,
        message,
        details?.ToArray() ?? Array.Empty<AppErrorDetail>());

    public static AppException Conflict(string code, string message, string field) => new(
        AppErrorKind.Conflict,
        code,
        message,
        [new AppErrorDetail(field, ValidationReasons.MustDiffer, message)]);
}
