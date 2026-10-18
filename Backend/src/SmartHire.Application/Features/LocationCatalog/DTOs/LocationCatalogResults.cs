namespace SmartHire.Application.Features.LocationCatalog.DTOs;

public sealed record LocationCatalogPageResult<TItem>(
    IReadOnlyList<TItem> Items,
    int Page,
    int PageSize,
    int TotalItems);

public sealed record ProvinceResult(
    Guid Id,
    string Name,
    string Status,
    bool IsCentrallyGoverned);

public sealed record ProvinceWithWardsResult(
    Guid Id,
    string Name,
    string Status,
    bool IsCentrallyGoverned,
    IReadOnlyList<WardResult> Items);

public sealed record WardResult(
    Guid Id,
    Guid ProvinceId,
    string Name,
    string Status,
    bool IsCommune);
