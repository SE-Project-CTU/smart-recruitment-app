namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record JobApplicationsPageResult(
    IReadOnlyList<ApplicationListItemResult> Items,
    int Page,
    int PageSize,
    int TotalItems);
