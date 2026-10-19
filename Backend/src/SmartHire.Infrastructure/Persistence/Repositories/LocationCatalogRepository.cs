using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class LocationCatalogRepository : ILocationCatalogRepository
{
    private readonly SmartHireDbContext _dbContext;

    public LocationCatalogRepository(SmartHireDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<bool> IsActiveProvinceAsync(Guid provinceId, CancellationToken cancellationToken)
    {
        return _dbContext.Provinces
            .AnyAsync(province => province.Id == provinceId &&
                                  province.Status == LocationStatus.Active,
                cancellationToken);
    }

    public Task<Guid?> GetActiveWardProvinceIdAsync(Guid wardId, CancellationToken cancellationToken)
    {
        return _dbContext.Wards
            .Where(ward => ward.Id == wardId && ward.Status == LocationStatus.Active)
            .Select(ward => (Guid?)ward.ProvinceId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Province> Items, int TotalCount)> GetActiveProvincesAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Provinces
            .AsNoTracking()
            .Where(province => province.Status == LocationStatus.Active);

        if (search is not null)
        {
            var pattern = $"%{search}%";
            query = query.Where(province => EF.Functions.ILike(province.Name, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(province => province.Name)
            .ThenBy(province => province.Id)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<Province> Items, int TotalCount)> GetActiveProvincesWithWardsAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Provinces
            .AsNoTracking()
            .Where(province => province.Status == LocationStatus.Active);

        if (search is not null)
        {
            var pattern = $"%{search}%";
            query = query.Where(province => EF.Functions.ILike(province.Name, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(province => province.Name)
            .ThenBy(province => province.Id)
            .Skip(skip)
            .Take(pageSize)
            .Include(province => province.Wards
                .Where(ward => ward.Status == LocationStatus.Active))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<(IReadOnlyList<Ward> Items, int TotalCount)> GetActiveWardsAsync(
        Guid? provinceId,
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Wards
            .AsNoTracking()
            .Where(ward => ward.Status == LocationStatus.Active);

        if (provinceId.HasValue)
        {
            query = query.Where(ward => ward.ProvinceId == provinceId.Value);
        }

        if (search is not null)
        {
            var pattern = $"%{search}%";
            query = query.Where(ward => EF.Functions.ILike(ward.Name, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(ward => ward.Name)
            .ThenBy(ward => ward.Id)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }
}
