namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record TransferOwnershipResult(
    Guid CompanyId,
    Guid PreviousOwnerId,
    Guid NewOwnerId,
    DateTimeOffset TransferredAt
);
