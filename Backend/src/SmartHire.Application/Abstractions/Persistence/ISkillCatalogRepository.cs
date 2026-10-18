using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ISkillCatalogRepository
{
    Task<(IReadOnlyList<Skill> Items, int TotalCount)> GetActiveSkillsAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
}
