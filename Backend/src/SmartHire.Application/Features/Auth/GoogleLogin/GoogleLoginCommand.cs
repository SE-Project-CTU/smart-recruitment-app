using MediatR;
using SmartHire.Application.Features.Auth.Login;

namespace SmartHire.Application.Features.Auth.GoogleLogin;

public sealed record GoogleLoginCommand(
    string? IdToken,
    string? Role
) : IRequest<LoginResult>;

