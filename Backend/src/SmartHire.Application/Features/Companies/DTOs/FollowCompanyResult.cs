namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record FollowCompanyResult(
    Guid CompanyId,
    bool Followed,
    DateTimeOffset CreatedAt
);
