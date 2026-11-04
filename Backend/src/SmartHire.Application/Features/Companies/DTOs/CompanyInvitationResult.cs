namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record CompanyBriefSummary(
    Guid Id,
    string Name,
    string VerificationStatus,
    string? LogoUrl = null,
    string? Address = null,
    string? Website = null
);

public sealed record CompanyInvitationInviterSummary(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl = null
);

public sealed record CompanyInvitationResult(
    Guid Id,
    Guid CompanyId,
    Guid InviterId,
    Guid InviteeId,
    string Status,
    DateTimeOffset ExpiresAt,
    DateTimeOffset CreatedAt,
    CompanyBriefSummary? Company = null,
    CompanyInvitationInviterSummary? Inviter = null,
    string? InviterEmail = null
);

