using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record MyApplicationListItemData(
    Guid Id,
    Guid JobId,
    ApplicationJobSummaryData Job,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    string CoverLetter,
    ApplicationStatus Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
