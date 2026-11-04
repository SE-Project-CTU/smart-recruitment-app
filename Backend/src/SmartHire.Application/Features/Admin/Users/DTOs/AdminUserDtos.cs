namespace SmartHire.Application.Features.Admin.Users.DTOs;

public sealed record AdminUserItemDto(
    Guid Id,
    string Email,
    string FullName,
    string? Phone,
    string? AvatarUrl,
    string Status,
    IReadOnlyList<string> Roles,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public sealed record UpdateUserStatusResult(
    Guid Id,
    string Status,
    bool RefreshTokensRevoked,
    DateTimeOffset UpdatedAt
);
