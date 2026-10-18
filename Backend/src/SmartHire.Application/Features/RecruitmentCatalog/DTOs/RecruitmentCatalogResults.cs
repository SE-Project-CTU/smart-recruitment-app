namespace SmartHire.Application.Features.RecruitmentCatalog.DTOs;

public sealed record RecruitmentCatalogPageResult<TItem>(
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
