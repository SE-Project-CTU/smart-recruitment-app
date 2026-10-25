namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record JobApplicationsPageResult(
    IReadOnlyList<JobApplicationListItemResult> Items,
    int Page,
    int PageSize,
    int TotalItems);
