using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Commands.InviteRecruiter;

public sealed record InviteRecruiterCommand(
    Guid CompanyId,
    string Email,
    DateTimeOffset? ExpiresAt
) : IRequest<CompanyInvitationResult>;
