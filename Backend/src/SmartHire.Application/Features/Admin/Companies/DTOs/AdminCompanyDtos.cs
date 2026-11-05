namespace SmartHire.Application.Features.Admin.Companies.DTOs;

public sealed record AdminCompanyOwnerDto(
    Guid Id,
    string FullName,
    string Email,
    string? Phone
);

public sealed record AdminCompanyItemDto(
    Guid Id,
    string Name,
    string TaxCode,
    string Email,
    string Phone,
    string? Address,
    string? Website,
    string? LogoUrl,
    string VerificationStatus,
    DateTimeOffset? VerifiedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    AdminCompanyOwnerDto? Owner
);

public sealed record AdminCompanyDetailDto(
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
    AdminCompanyOwnerDto? Owner,
    int MemberCount,
    int JobPostingCount
);

public sealed record ReviewCompanyVerificationResult(
    Guid Id,
    string VerificationStatus,
    DateTimeOffset? VerifiedAt,
    DateTimeOffset UpdatedAt
);
