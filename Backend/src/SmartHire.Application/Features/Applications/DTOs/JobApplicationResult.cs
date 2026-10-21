namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record JobApplicationResult(
    Guid Id,
    Guid JobId,
    Guid CandidateId,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    string CoverLetter,
    string Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
