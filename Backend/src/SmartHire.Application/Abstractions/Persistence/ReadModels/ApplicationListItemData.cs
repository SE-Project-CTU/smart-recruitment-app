using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record ApplicationListItemData(
    Guid Id,
    Guid JobId,
    Guid CandidateId,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    string CoverLetter,
    ApplicationStatus Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
