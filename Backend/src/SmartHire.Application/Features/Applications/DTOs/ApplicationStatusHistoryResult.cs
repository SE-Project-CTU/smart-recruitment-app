namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record ApplicationStatusHistoryActorResult(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl,
    string? Role);

public sealed record ApplicationStatusHistoryResult(
    Guid Id,
    Guid ApplicationId,
    string Status,
    ApplicationStatusHistoryActorResult ChangedBy,
    string? Note,
    DateTimeOffset CreatedAt);
