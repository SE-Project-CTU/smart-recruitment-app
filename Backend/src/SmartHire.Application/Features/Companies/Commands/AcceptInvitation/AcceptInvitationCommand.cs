using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Commands.AcceptInvitation;

public sealed record AcceptInvitationCommand(
    Guid InvitationId
) : IRequest<AcceptInvitationResult>;
