using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record CurrentAccountData(
    Guid Id,
    string Email,
    string? Phone,
    string FullName,
    string? AvatarUrl,
    IReadOnlyList<string> Roles,
    UserStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);