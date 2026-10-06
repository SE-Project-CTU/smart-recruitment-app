using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Auth.RegisterCandidate;

public sealed record RegisterCandidateResult(
    Guid Id,
    string Email,
    string? Phone,
    string FullName,
    IReadOnlyList<string> Roles,
    string Status,
    DateTimeOffset CreatedAt
);
