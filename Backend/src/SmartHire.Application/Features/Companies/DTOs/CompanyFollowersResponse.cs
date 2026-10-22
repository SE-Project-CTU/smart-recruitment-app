namespace SmartHire.Application.Features.Companies.DTOs;

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
