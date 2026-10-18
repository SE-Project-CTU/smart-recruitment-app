using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class SkillCatalogRepository : ISkillCatalogRepository
{
    private readonly SmartHireDbContext _dbContext;

    public SkillCatalogRepository(SmartHireDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(IReadOnlyList<Skill> Items, int TotalCount)> GetActiveSkillsAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Skills
            .AsNoTracking()
            .Where(skill => skill.IsActive);

        if (search is not null)
        {
            var pattern = $"%{search}%";
            query = query.Where(skill => EF.Functions.ILike(skill.Name, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(skill => skill.Name)
            .ThenBy(skill => skill.Id)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
