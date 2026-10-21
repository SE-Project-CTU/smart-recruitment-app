using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

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
