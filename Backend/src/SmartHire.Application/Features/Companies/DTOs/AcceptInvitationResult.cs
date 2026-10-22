namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record AcceptInvitationMembershipResult(
    Guid Id,
    Guid CompanyId,
    Guid UserId,
    string Role,
    string Status,
    DateTimeOffset JoinedAt
);

public sealed record AcceptInvitationResult(
    Guid InvitationId,
    string InvitationStatus,
    AcceptInvitationMembershipResult Membership
);
