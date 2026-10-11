namespace SmartHire.Application.Features.Auth.RegisterAccount;

public sealed record RegisterAccountResult(
    Guid Id,
    string Email,
    string? Phone,
    string FullName,
    IReadOnlyList<string> Roles,
    string Status,
    DateTimeOffset CreatedAt
);
