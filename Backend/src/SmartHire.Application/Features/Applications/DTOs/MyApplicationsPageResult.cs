namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record MyApplicationsPageResult(
    IReadOnlyList<ApplicationListItemResult> Items,
    int Page,
    int PageSize,
    int TotalItems);

public sealed record ApplicationListItemResult(
    Guid Id,
    Guid JobId,
    Guid CandidateId,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    string CoverLetter,
    string Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
