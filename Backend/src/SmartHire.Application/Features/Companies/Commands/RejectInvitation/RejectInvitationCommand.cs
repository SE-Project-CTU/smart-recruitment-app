using MediatR;

namespace SmartHire.Application.Features.Companies.Commands.RejectInvitation;

public sealed record RejectInvitationCommand(
    Guid InvitationId
) : IRequest;
