using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Rbac.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class PermissionRepository : IPermissionRepository {
    private readonly SmartHireDbContext _dbContext;

    public PermissionRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    public Task<Permission?> GetByIdAsync(Guid id, CancellationToken cancellationToken) {
        return _dbContext.Permissions.SingleOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public Task<Permission?> GetByCodeAsync(string code, CancellationToken cancellationToken) {
        var normalized = code.Trim().ToUpperInvariant();
        return _dbContext.Permissions.SingleOrDefaultAsync(p => p.Code == normalized, cancellationToken);
    }

    public Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default) {
        var normalized = code.Trim().ToUpperInvariant();
        var query = _dbContext.Permissions.Where(p => p.Code == normalized);
        if (excludeId.HasValue) {
            query = query.Where(p => p.Id != excludeId.Value);
        }
        return query.AnyAsync(cancellationToken);
    }

    public async Task AddAsync(Permission permission, CancellationToken cancellationToken) {
        await _dbContext.Permissions.AddAsync(permission, cancellationToken);
    }

    public async Task<(IReadOnlyList<PermissionDto> Items, int TotalCount)> GetPermissionsPagedAsync(
        string? search,
        string? module,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.Permissions.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search)) {
            var trimmed = search.Trim();
            query = query.Where(p => EF.Functions.ILike(p.Name, $"%{trimmed}%") || EF.Functions.ILike(p.Code, $"%{trimmed}%"));
        }

        if (!string.IsNullOrWhiteSpace(module)) {
            var mod = module.Trim();
            query = query.Where(p => p.Module == mod);
        }

        if (isActive.HasValue) {
            query = query.Where(p => p.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(p => p.Module)
            .ThenBy(p => p.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new PermissionDto(
                p.Id,
                p.Code,
                p.Name,
                p.Description,
                p.Module,
                p.IsActive,
                p.CreatedAt,
                p.UpdatedAt
            ))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<bool> HasAssignedRolesAsync(Guid permissionId, CancellationToken cancellationToken) {
        return _dbContext.RolePermissions.AnyAsync(rp => rp.PermissionId == permissionId, cancellationToken);
    }

    public Task<List<Permission>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken) {
        var distinctIds = ids.Distinct().ToList();
        return _dbContext.Permissions.Where(p => distinctIds.Contains(p.Id)).ToListAsync(cancellationToken);
    }
}

