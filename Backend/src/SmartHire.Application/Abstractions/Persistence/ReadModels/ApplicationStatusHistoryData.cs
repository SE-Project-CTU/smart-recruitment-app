using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record ApplicationStatusHistoryActorData(
    Guid Id,
    string FullName,
    string Email,
    string? AvatarUrl,
    string? Role);

public sealed record ApplicationStatusHistoryData(
    Guid Id,
    Guid ApplicationId,
    ApplicationStatus Status,
    ApplicationStatusHistoryActorData ChangedBy,
    string? Note,
    DateTimeOffset CreatedAt);
