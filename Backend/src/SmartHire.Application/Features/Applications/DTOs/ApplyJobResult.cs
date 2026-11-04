namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record ApplyJobResult(
    Guid Id,
    Guid JobId,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    string CoverLetter,
    string Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
