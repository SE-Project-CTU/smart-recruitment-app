using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class IndustryCatalogRepository : IIndustryCatalogRepository
{
    private readonly SmartHireDbContext _dbContext;

    public IndustryCatalogRepository(SmartHireDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<(IReadOnlyList<IndustryGroup> Items, int TotalCount)> GetActiveIndustryGroupsAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.IndustryGroups
            .AsNoTracking()
            .Where(group => group.IsActive);

        if (search is not null)
        {
            var pattern = $"%{search}%";
            query = query.Where(group => EF.Functions.ILike(group.Name, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(group => group.Name)
            .ThenBy(group => group.Id)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<IndustryGroup> Items, int TotalCount)> GetActiveIndustryGroupsWithIndustriesAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.IndustryGroups
            .AsNoTracking()
            .Where(group => group.IsActive);

        if (search is not null)
        {
            var pattern = $"%{search}%";
            query = query.Where(group => EF.Functions.ILike(group.Name, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(group => group.Name)
            .ThenBy(group => group.Id)
            .Skip(skip)
            .Take(pageSize)
            .Include(group => group.Industries.Where(industry => industry.IsActive))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<bool> IndustryGroupExistsAsync(Guid groupId, CancellationToken cancellationToken)
    {
        return _dbContext.IndustryGroups
            .AnyAsync(group => group.Id == groupId, cancellationToken);
    }

    public async Task<HashSet<Guid>> GetActiveIndustryIdsAsync(
        IReadOnlyCollection<Guid> industryIds,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Industries
            .AsNoTracking()
            .Where(industry => industry.IsActive && industryIds.Contains(industry.Id))
            .Select(industry => industry.Id)
            .ToHashSetAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Industry> Items, int TotalCount)> GetActiveIndustriesAsync(
        Guid? groupId,
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Industries
            .AsNoTracking()
            .Where(industry => industry.IsActive);

        if (groupId.HasValue)
        {
            query = query.Where(industry => industry.GroupId == groupId.Value);
        }

        if (search is not null)
        {
            var pattern = $"%{search}%";
            query = query.Where(industry => EF.Functions.ILike(industry.Name, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(industry => industry.Name)
            .ThenBy(industry => industry.Id)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    // Admin methods
    public async Task<(IReadOnlyList<AdminIndustryGroupDto> Items, int TotalCount)> GetAdminIndustryGroupsPagedAsync(
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.IndustryGroups.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(g => EF.Functions.ILike(g.Name, pattern));
        }

        if (isActive.HasValue)
        {
            query = query.Where(g => g.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(g => g.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(g => new AdminIndustryGroupDto(
                g.Id,
                g.Name,
                g.IsActive,
                g.Industries.Count
            ))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<IndustryGroup?> GetGroupByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.IndustryGroups.SingleOrDefaultAsync(g => g.Id == id, cancellationToken);
    }

    public Task<bool> GroupNameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken)
    {
        var trimmed = name.Trim();
        var query = _dbContext.IndustryGroups.Where(g => EF.Functions.ILike(g.Name, trimmed));
        if (excludeId.HasValue)
        {
            query = query.Where(g => g.Id != excludeId.Value);
        }
        return query.AnyAsync(cancellationToken);
    }

    public async Task AddGroupAsync(IndustryGroup group, CancellationToken cancellationToken)
    {
        await _dbContext.IndustryGroups.AddAsync(group, cancellationToken);
    }

    public Task<bool> HasLinkedIndustriesAsync(Guid groupId, CancellationToken cancellationToken)
    {
        return _dbContext.Industries.AnyAsync(i => i.GroupId == groupId, cancellationToken);
    }

    public async Task<(IReadOnlyList<AdminIndustryDto> Items, int TotalCount)> GetAdminIndustriesPagedAsync(
        Guid? groupId,
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Industries.AsNoTracking();

        if (groupId.HasValue)
        {
            query = query.Where(i => i.GroupId == groupId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(i => EF.Functions.ILike(i.Name, pattern));
        }

        if (isActive.HasValue)
        {
            query = query.Where(i => i.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(i => i.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new AdminIndustryDto(
                i.Id,
                i.GroupId,
                i.Group.Name,
                i.Name,
                i.IsActive
            ))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<Industry?> GetIndustryByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.Industries.SingleOrDefaultAsync(i => i.Id == id, cancellationToken);
    }

    public Task<bool> IndustryNameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken)
    {
        var trimmed = name.Trim();
        var query = _dbContext.Industries.Where(i => EF.Functions.ILike(i.Name, trimmed));
        if (excludeId.HasValue)
        {
            query = query.Where(i => i.Id != excludeId.Value);
        }
        return query.AnyAsync(cancellationToken);
    }

    public async Task AddIndustryAsync(Industry industry, CancellationToken cancellationToken)
    {
        await _dbContext.Industries.AddAsync(industry, cancellationToken);
    }

    public Task<bool> HasLinkedJobPostingsForIndustryAsync(Guid industryId, CancellationToken cancellationToken)
    {
        return _dbContext.JobIndustries.AnyAsync(ji => ji.IndustryId == industryId, cancellationToken);
    }
}
