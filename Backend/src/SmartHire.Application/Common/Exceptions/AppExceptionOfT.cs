using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Common.Exceptions;

public sealed class AppException<TData> : AppExceptionBase
    where TData : notnull {
    public TData Payload { get; }
    /// <summary>
    /// Gets the typed payload as the data included in the API error response.
    /// </summary>
    public override object ErrorData => Payload;

    /// <summary>
    /// Creates an application exception with a typed error payload.
    /// </summary>
    /// <param name="kind">The application error category used for HTTP status mapping.</param>
    /// <param name="code">The machine-readable error code.</param>
    /// <param name="message">The human-readable error message.</param>
    /// <param name="payload">The additional data included in the error response.</param>
    /// <param name="details">Optional field-level error details.</param>
    public AppException(
        AppErrorKind kind,
        string code,
        string message,
        TData payload,
        IReadOnlyList<AppErrorDetail>? details = null
    ) : base(kind, code, message, details) {
        Payload = payload;
    }
}
