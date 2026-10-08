namespace SmartHire.Application.Common.Errors;

public static class CommonErrorCodes {
    public const string CorrelationIdRequired = "CORRELATION_ID_REQUIRED";
    public const string CorrelationIdInvalid = "CORRELATION_ID_INVALID";
    public const string InternalServerError = "INTERNAL_SERVER_ERROR";
    public const string InvalidPageNumber = "INVALID_PAGE_NUMBER";
    public const string InvalidPageSize = "INVALID_PAGE_SIZE";
    public const string ValidationError = "VALIDATION_ERROR";
    public const string InvalidRequestBody = "INVALID_REQUEST_BODY";
}
