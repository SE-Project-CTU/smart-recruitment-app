using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record ApplicationStatusHistoryData(
    Guid Id,
    Guid ApplicationId,
    ApplicationStatus Status,
    Guid ChangedBy,
    string? Note,
    DateTimeOffset CreatedAt);
