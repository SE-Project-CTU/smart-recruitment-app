namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record JobApplicationResult(
    Guid Id,
    Guid JobId,
    ApplicationJobSummaryResult Job,
    ApplicationCandidateResult Candidate,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    ApplicationCvSnapshotResult? CvSnapshot,
    string CoverLetter,
    string Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
