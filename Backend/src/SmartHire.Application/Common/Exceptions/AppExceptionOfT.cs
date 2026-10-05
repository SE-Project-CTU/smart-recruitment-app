using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Common.Exceptions;

public sealed class AppException<TData> : AppExceptionBase
    where TData : notnull {
    public TData Payload { get; }
    public override object ErrorData => Payload;

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
