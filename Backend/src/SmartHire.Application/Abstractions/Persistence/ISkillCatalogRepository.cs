using SmartHire.Application.Features.Admin.Catalogs.DTOs;
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

    // Admin methods
    Task<(IReadOnlyList<AdminSkillDto> Items, int TotalCount)> GetAdminSkillsPagedAsync(
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<Skill?> GetSkillByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> SkillNameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken);
    Task AddSkillAsync(Skill skill, CancellationToken cancellationToken);
    Task<bool> HasLinkedJobPostingsForSkillAsync(Guid skillId, CancellationToken cancellationToken);
}
