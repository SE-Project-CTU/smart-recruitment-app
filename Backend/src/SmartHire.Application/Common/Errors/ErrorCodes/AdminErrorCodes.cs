namespace SmartHire.Application.Common.Errors;

public static class AdminErrorCodes {
    public const string UserNotFound = "ADMIN_USER_NOT_FOUND";
    public const string CannotLockLastAdmin = "ADMIN_CANNOT_LOCK_LAST_ADMIN";
    public const string CompanyNotFound = "ADMIN_COMPANY_NOT_FOUND";
    public const string CompanyAlreadyVerified = "ADMIN_COMPANY_ALREADY_VERIFIED";
    public const string InvalidStatusTransition = "ADMIN_INVALID_STATUS_TRANSITION";
    public const string ReasonRequired = "ADMIN_REASON_REQUIRED";

    // Phase 3
    public const string JobPostingNotFound = "ADMIN_JOB_POSTING_NOT_FOUND";
    public const string CompanyNotVerifiedForJobApproval = "ADMIN_COMPANY_NOT_VERIFIED_FOR_JOB_APPROVAL";
    public const string JobAlreadyModerated = "ADMIN_JOB_ALREADY_MODERATED";
    public const string RoleNotFound = "ADMIN_ROLE_NOT_FOUND";
    public const string PermissionNotFound = "ADMIN_PERMISSION_NOT_FOUND";
    public const string PermissionCodeAlreadyExists = "ADMIN_PERMISSION_CODE_ALREADY_EXISTS";
    public const string InvalidPermissionIds = "ADMIN_INVALID_PERMISSION_IDS";
}
