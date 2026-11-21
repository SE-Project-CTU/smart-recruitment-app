namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record WithdrawApplicationResult(
    Guid ApplicationId,
    string Status,
    DateTimeOffset UpdatedAt);
