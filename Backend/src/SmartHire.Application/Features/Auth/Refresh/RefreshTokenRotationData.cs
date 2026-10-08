using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Auth.Refresh;

public sealed record RefreshTokenRotationData(
    Guid Id,
    Guid UserId,
    DateTimeOffset ExpiresAt,
    DateTimeOffset? RevokedAt,
    UserStatus UserStatus,
    string Email,
    string FullName,
    IReadOnlyList<string> RoleNames
);