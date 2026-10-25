namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record JobApplicationListItemResult(
    Guid Id,
    Guid JobId,
    ApplicationCandidateResult Candidate,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    string CoverLetter,
    string Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
