namespace SmartHire.Application.Features.Cv.Queries.GetCvVersions;

public sealed record CvVersionPageResult(
    IReadOnlyList<CvVersionSummaryResult> Items,
    int Page,
    int PageSize,
    int TotalItems);

public sealed record CvVersionSummaryResult(
    Guid Id,
    Guid CvId,
    int VersionNumber,
    string Language,
    DateTimeOffset CreatedAt);
