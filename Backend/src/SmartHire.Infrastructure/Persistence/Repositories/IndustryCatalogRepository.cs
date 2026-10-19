using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
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
}
