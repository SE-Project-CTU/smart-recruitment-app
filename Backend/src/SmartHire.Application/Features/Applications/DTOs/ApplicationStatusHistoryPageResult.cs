namespace SmartHire.Application.Features.Applications.DTOs;

public sealed record ApplicationStatusHistoryPageResult(
    IReadOnlyList<ApplicationStatusHistoryResult> Items,
    int Page,
    int PageSize,
    int TotalItems);
