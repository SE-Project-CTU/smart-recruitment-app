namespace SmartHire.Application.Features.Companies.DTOs;

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
