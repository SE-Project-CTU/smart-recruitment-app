namespace SmartHire.Application.Common.Errors;

public static class CompanyErrorCodes {
    public const string CompanyNotFound = "COMPANY_NOT_FOUND";
    public const string CompanyTaxCodeAlreadyExists = "COMPANY_TAX_CODE_ALREADY_EXISTS";
    public const string CompanyForbidden = "COMPANY_FORBIDDEN";
    public const string CompanyMembershipNotFound = "COMPANY_MEMBERSHIP_NOT_FOUND";
    public const string CompanyMembershipAlreadyExists = "COMPANY_MEMBERSHIP_ALREADY_EXISTS";
    public const string CompanyInvitationNotFound = "COMPANY_INVITATION_NOT_FOUND";
    public const string CompanyInvitationAlreadyExists = "COMPANY_INVITATION_ALREADY_EXISTS";
    public const string CompanyInvitationAlreadyProcessed = "COMPANY_INVITATION_ALREADY_PROCESSED";
    public const string CompanyInvitationExpired = "COMPANY_INVITATION_EXPIRED";
    public const string CompanyJoinRequestNotFound = "COMPANY_JOIN_REQUEST_NOT_FOUND";
    public const string CompanyJoinRequestAlreadyExists = "COMPANY_JOIN_REQUEST_ALREADY_EXISTS";
    public const string CompanyJoinRequestAlreadyProcessed = "COMPANY_JOIN_REQUEST_ALREADY_PROCESSED";
    public const string CompanyAlreadyFollowed = "COMPANY_ALREADY_FOLLOWED";
    public const string CompanyNotFollowed = "COMPANY_NOT_FOLLOWED";
    public const string CompanyNewOwnerInvalid = "COMPANY_NEW_OWNER_INVALID";
    public const string InvalidCompanyData = "INVALID_COMPANY_DATA";
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string NotCompanyOwner = "NOT_COMPANY_OWNER";
    public const string CompanyLogoAlreadyInUse = "COMPANY_LOGO_ALREADY_IN_USE";
}
