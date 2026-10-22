using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Cv.Exceptions;

internal static class CvExceptions
{
    public static AppException InvalidCvId() => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        "CV id must be a valid UUID.",
        [new AppErrorDetail("id", ValidationReasons.InvalidFormat,
            "Provide a non-empty CV id.")]);

    public static AppException InvalidAccessToken(string message) => new(
        AppErrorKind.Unauthorized,
        AuthErrorCodes.InvalidAccessToken,
        message,
        [new AppErrorDetail("userId", ValidationReasons.InvalidFormat,
            "A valid user identity could not be read from the access token.")]);

    public static AppException CandidateRoleRequired(string action) => new(
        AppErrorKind.Forbidden,
        CvErrorCodes.CandidateRoleRequired,
        $"Only Candidate users can {action}.",
        [new AppErrorDetail("role", ValidationReasons.NotAllowed,
            $"The current user must have the Candidate role to {action} a CV.")]);

    public static AppException CvNotFound() => new(
        AppErrorKind.NotFound,
        CvErrorCodes.CvNotFound,
        "CV was not found.",
        [new AppErrorDetail("id", ErrorDetailReasons.NotFound,
            "The requested CV does not exist.")]);

    public static AppException CvNotOwned(string action) => new(
        AppErrorKind.Forbidden,
        CvErrorCodes.CvNotOwned,
        $"You are not allowed to {action} this CV.",
        [new AppErrorDetail("id", ValidationReasons.NotAllowed,
            $"Only the CV owner can {action} it.")]);

    public static AppException CvUpdateConflict() => new(
        AppErrorKind.Conflict,
        CvErrorCodes.CvUpdateConflict,
        "CV was updated by another request. Reload it and retry.",
        [new AppErrorDetail("id", ErrorDetailReasons.ConcurrentModification,
            "The CV changed while its new version was being created.")]);

    public static AppException Validation(string message, IEnumerable<AppErrorDetail> details) => new(
        AppErrorKind.Validation,
        CommonErrorCodes.ValidationError,
        message,
        details.ToArray());

    public static AppException TemplateNotFound() => new(
        AppErrorKind.NotFound,
        CvTemplateErrorCodes.TemplateNotFound,
        "CV template was not found.",
        [new AppErrorDetail("templateId", ErrorDetailReasons.NotFound,
            "The selected CV template does not exist.")]);

    public static AppException TemplateInactive() => new(
        AppErrorKind.Conflict,
        CvTemplateErrorCodes.TemplateInactive,
        "CV template is no longer active.",
        [new AppErrorDetail("templateId", ErrorDetailReasons.Inactive,
            "The selected CV template is inactive and cannot be used.")]);

    public static AppException CvVersionNotFound() => new(
        AppErrorKind.NotFound,
        CvErrorCodes.CvVersionNotFound,
        "CV version was not found.",
        [new AppErrorDetail("versionId", ErrorDetailReasons.NotFound,
            "The requested version does not exist for this CV.")]);

    public static AppException AccountNotAllowed() => new(
        AppErrorKind.Forbidden,
        AuthErrorCodes.AccountNotAllowed,
        "You are not authorized to access this resource.");

    public static void EnsureOwner(Guid? currentUserId, Guid candidateId)
    {
        if (currentUserId is null)
        {
            throw InvalidAccessToken(
                "The access token does not contain a valid user id.");
        }

        if (currentUserId != candidateId)
        {
            throw new AppException(
                AppErrorKind.Forbidden,
                CvErrorCodes.CvNotOwned,
                "You are not authorized to access this CV.",
                [new AppErrorDetail("id", ErrorDetailReasons.NotFound,
                    "The CV does not belong to the current user.")]);
        }
    }

    public static AppException InvalidLanguage(string message, string field) => new(
        AppErrorKind.BadRequest,
        CommonErrorCodes.ValidationError,
        message,
        [new AppErrorDetail(field, ValidationReasons.InvalidFormat, message)]);

    public static AppException MediaFileNotFound(string fieldName, Guid fileId) => new(
        AppErrorKind.NotFound,
        MediaErrorCodes.MediaFileNotFound,
        "Media file was not found.",
        [new AppErrorDetail(fieldName, ErrorDetailReasons.NotFound,
            $"The specified media file '{fileId}' does not exist.")]);

    public static AppException MediaFileForbidden(string fieldName) => new(
        AppErrorKind.Forbidden,
        MediaErrorCodes.MediaFileForbidden,
        "You do not have permission to use this media file.",
        [new AppErrorDetail(fieldName, ValidationReasons.NotAllowed,
            "The media file does not belong to the current user.")]);
}
