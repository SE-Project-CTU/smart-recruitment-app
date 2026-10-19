using MediatR;

namespace SmartHire.Application.Features.Account.ChangePassword;

public sealed record ChangePasswordCommand(
    string? CurrentPassword,
    string? NewPassword,
    bool RevokeAllSessions
) : IRequest;
