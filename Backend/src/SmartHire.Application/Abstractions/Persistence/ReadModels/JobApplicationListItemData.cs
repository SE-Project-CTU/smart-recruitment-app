using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence.ReadModels;

public sealed record JobApplicationListItemData(
    Guid Id,
    Guid JobId,
    ApplicationCandidateData Candidate,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    string CoverLetter,
    ApplicationStatus Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
