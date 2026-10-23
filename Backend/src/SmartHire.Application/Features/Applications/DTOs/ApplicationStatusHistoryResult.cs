namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record ApplicationStatusHistoryResult(
    Guid Id,
    Guid ApplicationId,
    string Status,
    Guid ChangedBy,
    string? Note,
    DateTimeOffset CreatedAt);
