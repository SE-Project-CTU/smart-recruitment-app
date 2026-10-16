namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record CompanyMembershipSummary(
    string Role,
    string Status
);

public sealed record CompanyResult(
    Guid Id,
    string Name,
    string TaxCode,
    string Email,
    string Phone,
    string? Address,
    string? Website,
    string? Description,
    string? LogoUrl,
    string VerificationStatus,
    DateTimeOffset? VerifiedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    CompanyMembershipSummary? Membership = null
);

public sealed record CompanyMemberUserSummary(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl
);

public sealed record CompanyMemberResult(
    Guid MembershipId,
    CompanyMemberUserSummary User,
    string Role,
    string Status,
    DateTimeOffset JoinedAt
);

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

public sealed record AcceptInvitationResult(
    Guid InvitationId,
    string InvitationStatus,
    AcceptInvitationMembershipResult Membership
);

public sealed record AcceptInvitationMembershipResult(
    Guid Id,
    Guid CompanyId,
    Guid UserId,
    string Role,
    string Status,
    DateTimeOffset JoinedAt
);

public sealed record CompanyJoinRequestUserSummary(
    Guid Id,
    string Email,
    string FullName
);

public sealed record CompanyJoinRequestResult(
    Guid Id,
    Guid CompanyId,
    Guid UserId,
    string Status,
    DateTimeOffset CreatedAt,
    CompanyJoinRequestUserSummary? User = null
);

public sealed record ReviewJoinRequestResult(
    Guid RequestId,
    Guid CompanyId,
    string Status,
    Guid? ReviewedBy,
    DateTimeOffset? ReviewedAt,
    AcceptInvitationMembershipResult? Membership
);

public sealed record TransferOwnershipResult(
    Guid CompanyId,
    Guid PreviousOwnerId,
    Guid NewOwnerId,
    DateTimeOffset TransferredAt
);

public sealed record FollowCompanyResult(
    Guid CompanyId,
    bool Followed,
    DateTimeOffset CreatedAt
);

public sealed record CompanyFollowerItem(
    Guid UserId,
    string FullName,
    string? AvatarUrl,
    DateTimeOffset FollowedAt
);

public sealed record CompanyFollowersResponse(
    Guid CompanyId,
    int FollowerCount,
    IReadOnlyList<CompanyFollowerItem> Followers
);
