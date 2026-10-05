using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Common.Exceptions;

public sealed class AppException : AppExceptionBase {
    public override object? ErrorData => null;
    
    public AppException(
        AppErrorKind kind,
        string code,
        string message,
        IReadOnlyList<AppErrorDetail>? details = null
    ) : base(kind, code, message, details) { }
}
