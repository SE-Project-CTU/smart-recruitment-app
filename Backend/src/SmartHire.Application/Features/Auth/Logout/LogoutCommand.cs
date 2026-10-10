using MediatR;

namespace SmartHire.Application.Features.Auth.Logout;

public sealed record LogoutCommand(
    string? RefreshToken,
    bool AllSessions
) : IRequest;