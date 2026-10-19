using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ISkillCatalogRepository
{
    Task<HashSet<Guid>> GetActiveSkillIdsAsync(
        IReadOnlyCollection<Guid> skillIds,
        CancellationToken cancellationToken);

    Task<(IReadOnlyList<Skill> Items, int TotalCount)> GetActiveSkillsAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
}
