namespace SmartHire.Application.Common.Errors;

public static class AuthErrorCodes {
    public const string EmailAlreadyExists = "AUTH_EMAIL_ALREADY_EXISTS";
    public const string PhoneAlreadyExists = "AUTH_PHONE_ALREADY_EXISTS";
    public const string CandidateRoleNotFound = "AUTH_CANDIDATE_ROLE_NOT_FOUND";
    public const string RecruiterRoleNotFound = "AUTH_RECRUITER_ROLE_NOT_FOUND";
    public const string InvalidCredentials = "AUTH_INVALID_CREDENTIALS";
    public const string AccountNotAllowed = "AUTH_ACCOUNT_NOTALLOWED";
    public const string InvalidRefreshToken = "AUTH_INVALID_REFRESH_TOKEN";
    public const string RefreshTokenNotFound = "AUTH_REFRESH_TOKEN_NOT_FOUND";
    public const string RefreshTokenNotOwned = "AUTH_REFRESH_TOKEN_NOT_OWNED";
    public const string LogoutTargetRequired = "AUTH_LOGOUT_TARGET_REQUIRED";
    public const string InvalidAccessToken = "AUTH_INVALID_ACCESS_TOKEN";
    public const string CurrentAccountNotFound = "AUTH_CURRENT_ACCOUNT_NOT_FOUND";
    public const string AvatarFileNotFound = "AUTH_AVATAR_FILE_NOT_FOUND";
    public const string AvatarFileNotOwned = "AUTH_AVATAR_FILE_NOT_OWNED";
}
