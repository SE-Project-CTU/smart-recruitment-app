namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record FollowedCompanyResult(
    Guid Id,
    string Name,
    string? TaxCode,
    string? Email,
    string? Phone,
    string? Address,
    string? Website,
    string? Description,
    string? LogoUrl,
    string VerificationStatus,
    int FollowerCount,
    int ActiveJobCount,
    DateTimeOffset FollowedAt
);
