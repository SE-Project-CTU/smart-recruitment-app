using MediatR;
using SmartHire.Application.Features.Auth.RegisterAccount;

namespace SmartHire.Application.Features.Auth.Login;

public sealed record LoginCommand(
    string Email,
    string Password
) : IRequest<LoginResult>;