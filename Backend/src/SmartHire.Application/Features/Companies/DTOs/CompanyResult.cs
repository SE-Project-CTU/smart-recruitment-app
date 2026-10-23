namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record CompanyMembershipSummary(
    string Role,
    string Status
);

public sealed record CompanyResult(
    Guid Id,
    string Name,
    string TaxCode,
    string Email,
    string Phone,
    string? Address,
    string? Website,
    string? Description,
    string? LogoUrl,
    string VerificationStatus,
    DateTimeOffset? VerifiedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    CompanyMembershipSummary? Membership = null
);
