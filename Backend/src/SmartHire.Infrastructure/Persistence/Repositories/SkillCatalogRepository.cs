using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class SkillCatalogRepository : ISkillCatalogRepository
{
    private readonly SmartHireDbContext _dbContext;

    public SkillCatalogRepository(SmartHireDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HashSet<Guid>> GetActiveSkillIdsAsync(
        IReadOnlyCollection<Guid> skillIds,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Skills
            .AsNoTracking()
            .Where(skill => skill.IsActive && skillIds.Contains(skill.Id))
            .Select(skill => skill.Id)
            .ToHashSetAsync(cancellationToken);
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

    // Admin methods
    public async Task<(IReadOnlyList<AdminSkillDto> Items, int TotalCount)> GetAdminSkillsPagedAsync(
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Skills.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(s => EF.Functions.ILike(s.Name, pattern));
        }

        if (isActive.HasValue)
        {
            query = query.Where(s => s.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(s => s.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new AdminSkillDto(
                s.Id,
                s.Name,
                s.IsActive,
                s.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<Skill?> GetSkillByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.Skills.SingleOrDefaultAsync(s => s.Id == id, cancellationToken);
    }

    public Task<bool> SkillNameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken)
    {
        var trimmed = name.Trim();
        var query = _dbContext.Skills.Where(s => EF.Functions.ILike(s.Name, trimmed));
        if (excludeId.HasValue)
        {
            query = query.Where(s => s.Id != excludeId.Value);
        }
        return query.AnyAsync(cancellationToken);
    }

    public async Task AddSkillAsync(Skill skill, CancellationToken cancellationToken)
    {
        await _dbContext.Skills.AddAsync(skill, cancellationToken);
    }

    public Task<bool> HasLinkedJobPostingsForSkillAsync(Guid skillId, CancellationToken cancellationToken)
    {
        return _dbContext.JobSkills.AnyAsync(js => js.SkillId == skillId, cancellationToken);
    }
}
