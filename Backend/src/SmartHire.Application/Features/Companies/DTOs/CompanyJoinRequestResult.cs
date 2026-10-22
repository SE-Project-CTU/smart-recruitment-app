namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record CompanyJoinRequestUserSummary(
    Guid Id,
    string Email,
    string FullName
);

public sealed record CompanyJoinRequestResult(
    Guid Id,
    Guid CompanyId,
    Guid UserId,
    string Status,
    DateTimeOffset CreatedAt,
    CompanyJoinRequestUserSummary? User = null
);
