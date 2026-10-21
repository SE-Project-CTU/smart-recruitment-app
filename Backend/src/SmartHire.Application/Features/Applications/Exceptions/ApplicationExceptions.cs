using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Exceptions;

internal static class ApplicationExceptions {
    public static AppException InvalidRequest(IEnumerable<AppErrorDetail> details) => new(
        AppErrorKind.Validation,
        ApplicationErrorCodes.InvalidApplication,
        "Application request contains invalid fields.",
        details.ToArray());

    public static AppException InvalidQuery(IEnumerable<AppErrorDetail> details) => new(
        AppErrorKind.BadRequest,
        ApplicationErrorCodes.InvalidApplicationQuery,
        "Application query contains invalid parameters.",
        details.ToArray());

    public static AppException InvalidApplicationId() => new(
        AppErrorKind.BadRequest,
        ApplicationErrorCodes.InvalidApplicationId,
        "Application ID has an invalid format.",
        [new AppErrorDetail("id", ValidationReasons.InvalidFormat,
            "The id path parameter must be a valid UUID.")]);

    public static AppException ApplicationNotFound(Guid id) => new(
        AppErrorKind.NotFound,
        ApplicationErrorCodes.ApplicationNotFound,
        "Application was not found.",
        [new AppErrorDetail("id", ErrorDetailReasons.NotFound,
            $"No application with ID '{id}' exists.")]);

    public static AppException ApplicationForbidden() => new(
        AppErrorKind.Forbidden,
        ApplicationErrorCodes.ApplicationForbidden,
        "You do not have permission to view this application.");

    public static AppException ApplicationManagementForbidden() => new(
        AppErrorKind.Forbidden,
        ApplicationErrorCodes.ApplicationForbidden,
        "You do not have permission to manage this application.");

    public static AppException InvalidStatusTransition(ApplicationStatus current, ApplicationStatus target) => new(
        AppErrorKind.Conflict,
        ApplicationErrorCodes.InvalidApplicationStatusTransition,
        $"Application status cannot be changed from '{current}' to '{target}'.",
        [new AppErrorDetail("status", ValidationReasons.NotAllowed,
            "The requested status transition is not allowed by the application workflow.")]);

    public static AppException ApplicationStatusConflict() => new(
        AppErrorKind.Conflict,
        ApplicationErrorCodes.ApplicationStatusConflict,
        "Application status was updated by another request. Reload it and retry.",
        [new AppErrorDetail("status", ErrorDetailReasons.ConcurrentModification,
            "The application changed while this status update was being saved. Reload it before retrying.")]);

    public static AppException InvalidAccessToken() => new(
        AppErrorKind.Unauthorized,
        AuthErrorCodes.InvalidAccessToken,
        "The access token does not contain a valid user ID.",
        [new AppErrorDetail("userId", ValidationReasons.InvalidFormat,
            "A valid user identity is required.")]);

    public static AppException JobNotFound(Guid id) => new(
        AppErrorKind.NotFound,
        ApplicationErrorCodes.JobNotFound,
        "Job posting was not found.",
        [new AppErrorDetail("jobPostingId", ErrorDetailReasons.NotFound,
            $"No job posting with ID '{id}' exists.")]);

    public static AppException JobNotAcceptingApplications() => new(
        AppErrorKind.Conflict,
        ApplicationErrorCodes.JobNotAcceptingApplications,
        "This job posting is not currently accepting applications.");

    public static AppException DuplicateApplication() => new(
        AppErrorKind.Conflict,
        ApplicationErrorCodes.DuplicateApplication,
        "You have already applied to this job posting.");

    public static AppException CvVersionNotFound() => new(
        AppErrorKind.NotFound,
        ApplicationErrorCodes.CvVersionNotFound,
        "CV version was not found.",
        [new AppErrorDetail("cvVersionId", ErrorDetailReasons.NotFound,
            "The selected CV version does not exist or is not owned by the current candidate.")]);

    public static AppException UploadedCvNotFound() => new(
        AppErrorKind.NotFound,
        ApplicationErrorCodes.UploadedCvFileNotFound,
        "Uploaded CV file was not found.",
        [new AppErrorDetail("uploadedCvFileId", ErrorDetailReasons.NotFound,
            "The selected file does not exist or is not owned by the current candidate.")]);

    public static AppException UploadedCvNotPdf() => new(
        AppErrorKind.UnsupportedMediaType,
        ApplicationErrorCodes.UploadedCvNotPdf,
        "The uploaded CV must be a PDF file.",
        [new AppErrorDetail("uploadedCvFileId", ValidationReasons.InvalidFormat,
            "The selected file must have content type application/pdf.")]);

    public static AppException UploadedCvTooLarge(long maxBytes) => new(
        AppErrorKind.PayloadTooLarge,
        ApplicationErrorCodes.UploadedCvTooLarge,
        "The uploaded CV exceeds the maximum allowed size of 5 MB.",
        [new AppErrorDetail("uploadedCvFileId", ValidationReasons.MaxLength,
            $"The selected PDF must not exceed {maxBytes} bytes.")]);

    public static AppException UploadedCvAlreadyUsed() => new(
        AppErrorKind.Conflict,
        ApplicationErrorCodes.UploadedCvAlreadyUsed,
        "This uploaded CV file is already attached to an application.");
}
