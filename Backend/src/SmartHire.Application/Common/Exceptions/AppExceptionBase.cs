using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Common.Exceptions;

public abstract class AppExceptionBase : Exception {
    public AppErrorKind Kind { get; }
    public string Code { get; }
    public IReadOnlyList<AppErrorDetail> Details { get; }
    public abstract object? ErrorData { get; }

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
