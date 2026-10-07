namespace SmartHire.Application.Features.Account.UpdateCurrentAccount;

public sealed record UpdateCurrentAccountResult(
    Guid Id,
    string Email,
    string? Phone,
    string FullName,
    string? AvatarUrl,
    IReadOnlyList<string> Roles,
    string Status,
    DateTimeOffset UpdatedAt
);