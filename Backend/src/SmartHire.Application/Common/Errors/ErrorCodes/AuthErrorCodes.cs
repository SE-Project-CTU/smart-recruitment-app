namespace SmartHire.Application.Common.Errors;

public static class AuthErrorCodes {
    public const string EmailAlreadyExists = "AUTH_EMAIL_ALREADY_EXISTS";
    public const string PhoneAlreadyExists = "AUTH_PHONE_ALREADY_EXISTS";
    public const string CandidateRoleNotFound = "AUTH_CANDIDATE_ROLE_NOT_FOUND";
    public const string RecruiterRoleNotFound = "AUTH_RECRUITER_ROLE_NOT_FOUND";
    public const string InvalidCredentials = "AUTH_INVALID_CREDENTIALS";
    public const string AccountNotAllowed = "AUTH_ACCOUNT_NOTALLOWED";
}