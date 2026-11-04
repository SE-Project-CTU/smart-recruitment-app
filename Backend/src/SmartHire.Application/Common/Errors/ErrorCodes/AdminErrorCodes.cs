namespace SmartHire.Application.Common.Errors;

public static class AdminErrorCodes {
    public const string UserNotFound = "ADMIN_USER_NOT_FOUND";
    public const string CannotLockLastAdmin = "ADMIN_CANNOT_LOCK_LAST_ADMIN";
    public const string CompanyNotFound = "ADMIN_COMPANY_NOT_FOUND";
    public const string CompanyAlreadyVerified = "ADMIN_COMPANY_ALREADY_VERIFIED";
    public const string InvalidStatusTransition = "ADMIN_INVALID_STATUS_TRANSITION";
    public const string ReasonRequired = "ADMIN_REASON_REQUIRED";

    public const string JobPostingNotFound = "ADMIN_JOB_POSTING_NOT_FOUND";
    public const string CompanyNotVerifiedForJobApproval = "ADMIN_COMPANY_NOT_VERIFIED_FOR_JOB_APPROVAL";
    public const string JobAlreadyModerated = "ADMIN_JOB_ALREADY_MODERATED";

    // Phase 4 - Catalogs
    public const string IndustryGroupNotFound = "ADMIN_INDUSTRY_GROUP_NOT_FOUND";
    public const string IndustryGroupNameAlreadyExists = "ADMIN_INDUSTRY_GROUP_NAME_ALREADY_EXISTS";
    public const string IndustryNotFound = "ADMIN_INDUSTRY_NOT_FOUND";
    public const string IndustryNameAlreadyExists = "ADMIN_INDUSTRY_NAME_ALREADY_EXISTS";
    public const string ProvinceNotFound = "ADMIN_PROVINCE_NOT_FOUND";
    public const string ProvinceNameAlreadyExists = "ADMIN_PROVINCE_NAME_ALREADY_EXISTS";
    public const string WardNotFound = "ADMIN_WARD_NOT_FOUND";
    public const string WardNameAlreadyExists = "ADMIN_WARD_NAME_ALREADY_EXISTS";
    public const string SkillNotFound = "ADMIN_SKILL_NOT_FOUND";
    public const string SkillNameAlreadyExists = "ADMIN_SKILL_NAME_ALREADY_EXISTS";
    public const string CvTemplateNotFound = "ADMIN_CV_TEMPLATE_NOT_FOUND";
    public const string CvTemplateCodeAlreadyExists = "ADMIN_CV_TEMPLATE_CODE_ALREADY_EXISTS";
}
