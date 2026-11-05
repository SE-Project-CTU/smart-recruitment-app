using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
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

    // Admin methods
    public async Task<(IReadOnlyList<AdminProvinceDto> Items, int TotalCount)> GetAdminProvincesPagedAsync(
        string? search,
        LocationStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Provinces.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(p => EF.Functions.ILike(p.Name, pattern));
        }

        if (status.HasValue)
        {
            query = query.Where(p => p.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new AdminProvinceDto(
                p.Id,
                p.Name,
                p.Status.ToString().ToUpperInvariant(),
                p.IsCentrallyGoverned,
                p.Wards.Count
            ))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<Province?> GetProvinceByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.Provinces.SingleOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public Task<bool> ProvinceNameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken)
    {
        var trimmed = name.Trim();
        var query = _dbContext.Provinces.Where(p => EF.Functions.ILike(p.Name, trimmed));
        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }
        return query.AnyAsync(cancellationToken);
    }

    public async Task AddProvinceAsync(Province province, CancellationToken cancellationToken)
    {
        await _dbContext.Provinces.AddAsync(province, cancellationToken);
    }

    public async Task<bool> HasLinkedWardsOrJobsAsync(Guid provinceId, CancellationToken cancellationToken)
    {
        var hasWards = await _dbContext.Wards.AnyAsync(w => w.ProvinceId == provinceId, cancellationToken);
        if (hasWards) return true;

        return await _dbContext.JobPostings.AnyAsync(j => j.ProvinceId == provinceId, cancellationToken);
    }

    public Task<int> GetWardsCountByProvinceIdAsync(Guid provinceId, CancellationToken cancellationToken)
    {
        return _dbContext.Wards.CountAsync(w => w.ProvinceId == provinceId, cancellationToken);
    }

    public async Task<(IReadOnlyList<AdminWardDto> Items, int TotalCount)> GetAdminWardsPagedAsync(
        Guid? provinceId,
        string? search,
        LocationStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Wards.AsNoTracking();

        if (provinceId.HasValue)
        {
            query = query.Where(w => w.ProvinceId == provinceId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(w => EF.Functions.ILike(w.Name, pattern));
        }

        if (status.HasValue)
        {
            query = query.Where(w => w.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(w => w.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(w => new AdminWardDto(
                w.Id,
                w.ProvinceId,
                w.Province.Name,
                w.Name,
                w.Status.ToString().ToUpperInvariant(),
                w.IsCommune
            ))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<Ward?> GetWardByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.Wards.SingleOrDefaultAsync(w => w.Id == id, cancellationToken);
    }

    public Task<bool> WardNameExistsInProvinceAsync(Guid provinceId, string name, Guid? excludeId, CancellationToken cancellationToken)
    {
        var trimmed = name.Trim();
        var query = _dbContext.Wards.Where(w => w.ProvinceId == provinceId && EF.Functions.ILike(w.Name, trimmed));
        if (excludeId.HasValue)
        {
            query = query.Where(w => w.Id != excludeId.Value);
        }
        return query.AnyAsync(cancellationToken);
    }

    public async Task AddWardAsync(Ward ward, CancellationToken cancellationToken)
    {
        await _dbContext.Wards.AddAsync(ward, cancellationToken);
    }

    public Task<bool> HasLinkedJobPostingsForWardAsync(Guid wardId, CancellationToken cancellationToken)
    {
        return _dbContext.JobPostings.AnyAsync(j => j.WardId == wardId, cancellationToken);
    }
}
