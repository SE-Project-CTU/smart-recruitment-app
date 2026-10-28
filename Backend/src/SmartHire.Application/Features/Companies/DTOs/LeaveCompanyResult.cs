namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record LeaveCompanyResult(
    Guid CompanyId,
    Guid UserId,
    DateTimeOffset LeftAt
);
