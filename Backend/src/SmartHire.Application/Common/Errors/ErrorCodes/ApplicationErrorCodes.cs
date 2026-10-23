namespace SmartHire.Application.Common.Errors.ErrorCodes;

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
    public const string InvalidApplicationId = "INVALID_APPLICATION_ID";
    public const string ApplicationNotFound = "APPLICATION_NOT_FOUND";
    public const string ApplicationForbidden = "APPLICATION_FORBIDDEN";
    public const string InvalidApplicationStatusTransition = "INVALID_APPLICATION_STATUS_TRANSITION";
    public const string ApplicationStatusConflict = "APPLICATION_STATUS_CONFLICT";
}
