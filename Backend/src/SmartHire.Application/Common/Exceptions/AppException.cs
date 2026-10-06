using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Common.Exceptions;

public sealed class AppException : AppExceptionBase {
    /// <summary>
    /// Gets null because this exception has no additional error payload.
    /// </summary>
    public override object? ErrorData => null;
    
    /// <summary>
    /// Creates an application exception without an additional error payload.
    /// </summary>
    /// <param name="kind">The application error category used for HTTP status mapping.</param>
    /// <param name="code">The machine-readable error code.</param>
    /// <param name="message">The human-readable error message.</param>
    /// <param name="details">Optional field-level error details.</param>
    public AppException(
        AppErrorKind kind,
        string code,
        string message,
        IReadOnlyList<AppErrorDetail>? details = null
    ) : base(kind, code, message, details) { }
}
