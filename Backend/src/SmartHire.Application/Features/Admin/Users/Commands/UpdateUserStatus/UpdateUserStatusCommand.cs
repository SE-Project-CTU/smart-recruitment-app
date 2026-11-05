using MediatR;
using SmartHire.Application.Features.Admin.Users.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Users.Commands.UpdateUserStatus;

public sealed record UpdateUserStatusCommand(
    Guid UserId,
    UserStatus Status,
    string? Reason = null
) : IRequest<UpdateUserStatusResult>;
