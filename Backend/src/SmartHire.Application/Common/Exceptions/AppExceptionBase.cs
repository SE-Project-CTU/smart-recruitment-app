using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Common.Exceptions;

public abstract class AppExceptionBase : Exception {
    public AppErrorKind Kind { get; }
    public string Code { get; }
    public IReadOnlyList<AppErrorDetail> Details { get; }
    /// <summary>
    /// Gets the optional payload to include in the API error response.
    /// </summary>
    public abstract object? ErrorData { get; }

    /// <summary>
    /// Initializes an application error and copies its details, using an empty list when omitted.
    /// </summary>
    /// <param name="kind">The application error category used for HTTP status mapping.</param>
    /// <param name="code">The machine-readable error code.</param>
    /// <param name="message">The human-readable error message.</param>
    /// <param name="details">Optional field-level error details.</param>
    protected AppExceptionBase(
        AppErrorKind kind,
        string code,
        string message,
        IReadOnlyList<AppErrorDetail>? details = null
    ) : base(message) {
        Kind = kind;
        Code = code;
        Details = details?.ToArray() ?? Array.Empty<AppErrorDetail>();
    }
}
