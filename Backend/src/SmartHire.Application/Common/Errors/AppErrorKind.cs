namespace SmartHire.Application.Common.Errors;

public enum AppErrorKind {
    BadRequest,
    Validation,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    Gone,
    PayloadTooLarge,
    UnsupportedMediaType
}
