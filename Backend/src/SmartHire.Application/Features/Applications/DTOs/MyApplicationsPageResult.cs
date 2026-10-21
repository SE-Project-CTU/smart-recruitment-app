namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record MyApplicationsPageResult(
    IReadOnlyList<MyApplicationListItemResult> Items,
    int Page,
    int PageSize,
    int TotalItems);

public sealed record MyApplicationListItemResult(
    Guid Id,
    Guid JobId,
    Guid CandidateId,
    Guid? CvVersionId,
    string? UploadedCvUrl,
    string CoverLetter,
    string Status,
    DateTimeOffset AppliedAt,
    DateTimeOffset UpdatedAt);
