namespace SmartHire.Application.Common.Errors;

public sealed record AppErrorDetail(
    string Field,
    string Reason,
    string Message
);