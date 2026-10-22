namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record ReviewJoinRequestResult(
    Guid RequestId,
    Guid CompanyId,
    string Status,
    Guid? ReviewedBy,
    DateTimeOffset? ReviewedAt,
    AcceptInvitationMembershipResult? Membership
);
