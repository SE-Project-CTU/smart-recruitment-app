using MediatR;

namespace SmartHire.Application.Features.Auth.Logout;

public sealed record LogoutCommand(
    Guid UserId,
    string? RefreshToken,
    bool AllSessions
) : IRequest;