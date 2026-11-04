namespace SmartHire.Application.Common.Errors;

public static class AdminErrorCodes {
    public const string UserNotFound = "ADMIN_USER_NOT_FOUND";
    public const string CannotLockLastAdmin = "ADMIN_CANNOT_LOCK_LAST_ADMIN";
    public const string CompanyNotFound = "ADMIN_COMPANY_NOT_FOUND";
    public const string CompanyAlreadyVerified = "ADMIN_COMPANY_ALREADY_VERIFIED";
    public const string InvalidStatusTransition = "ADMIN_INVALID_STATUS_TRANSITION";
    public const string ReasonRequired = "ADMIN_REASON_REQUIRED";
}

