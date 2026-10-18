namespace SmartHire.Application.Features.SkillCatalog.DTOs;

public sealed record SkillCatalogPageResult<TItem>(
    IReadOnlyList<TItem> Items,
    int Page,
    int PageSize,
    int TotalItems);

public sealed record SkillResult(Guid Id, string Name, bool IsActive);
