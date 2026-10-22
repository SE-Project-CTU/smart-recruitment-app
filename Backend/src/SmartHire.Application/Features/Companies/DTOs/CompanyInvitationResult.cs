namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record CompanyBriefSummary(
    Guid Id,
    string Name,
    string VerificationStatus
);

public sealed record CompanyInvitationResult(
    Guid Id,
    Guid CompanyId,
    Guid InviterId,
    Guid InviteeId,
    string Status,
    DateTimeOffset ExpiresAt,
    DateTimeOffset CreatedAt,
    CompanyBriefSummary? Company = null
);
