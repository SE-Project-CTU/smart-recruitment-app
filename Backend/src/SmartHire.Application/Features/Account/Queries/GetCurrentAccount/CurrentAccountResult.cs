namespace SmartHire.Application.Features.Account.GetCurrentAccount;

public sealed record CurrentAccountResult(
    Guid Id,
    string Email,
    string? Phone,
    string FullName,
    string? AvatarUrl,
    IReadOnlyList<string> Roles,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);