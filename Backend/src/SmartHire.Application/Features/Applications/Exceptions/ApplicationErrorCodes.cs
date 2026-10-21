namespace SmartHire.Application.Features.Applications.Exceptions;

public static class ApplicationErrorCodes {
    public const string InvalidApplication = "INVALID_APPLICATION";
    public const string JobNotFound = "JOB_POSTING_NOT_FOUND";
    public const string JobNotAcceptingApplications = "JOB_NOT_ACCEPTING_APPLICATIONS";
    public const string DuplicateApplication = "APPLICATION_ALREADY_EXISTS";
    public const string CvVersionNotFound = "CV_VERSION_NOT_FOUND";
    public const string UploadedCvFileNotFound = "UPLOADED_CV_FILE_NOT_FOUND";
    public const string UploadedCvNotPdf = "UPLOADED_CV_NOT_PDF";
    public const string UploadedCvTooLarge = "UPLOADED_CV_TOO_LARGE";
    public const string UploadedCvAlreadyUsed = "UPLOADED_CV_ALREADY_USED";
    public const string InvalidApplicationQuery = "INVALID_APPLICATION_QUERY";
}
