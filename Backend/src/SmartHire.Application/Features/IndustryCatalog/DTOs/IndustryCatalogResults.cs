namespace SmartHire.Application.Features.IndustryCatalog.DTOs;

public sealed record IndustryCatalogPageResult<TItem>(
    IReadOnlyList<TItem> Items,
    int Page,
    int PageSize,
    int TotalItems);

public sealed record IndustryGroupResult(Guid Id, string Name, bool IsActive);

public sealed record IndustryGroupWithIndustriesResult(
    Guid Id,
    string Name,
    bool IsActive,
    IReadOnlyList<IndustryResult> Items);

public sealed record IndustryResult(
    Guid Id,
    Guid GroupId,
    string Name,
    string Status,
    bool IsActive);