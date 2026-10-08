using MediatR;
using SmartHire.Application.Features.Auth.RegisterAccount;

namespace SmartHire.Application.Features.Auth.RegisterRecruiter;

public sealed record RegisterRecruiterCommand(
    string Email,
    string? Phone,
    string Password,
    string FullName
) : IRequest<RegisterAccountResult>;
