using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Rbac.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class RoleRepository : IRoleRepository {
    private readonly SmartHireDbContext _dbContext;

    public RoleRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    public Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken) {
        return _dbContext.Roles.SingleOrDefaultAsync(
            role => role.Name == name,
            cancellationToken
        );
    }

    public Task<Role?> GetByIdWithPermissionsAsync(Guid id, CancellationToken cancellationToken) {
        return _dbContext.Roles
            .Include(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission)
            .SingleOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<RoleWithPermissionsDto>> GetAllWithPermissionsAsync(CancellationToken cancellationToken) {
        return await _dbContext.Roles
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .Select(r => new RoleWithPermissionsDto(
                r.Id,
                r.Name,
                r.RolePermissions
                    .OrderBy(rp => rp.Permission.Module)
                    .ThenBy(rp => rp.Permission.Code)
                    .Select(rp => new PermissionDto(
                        rp.Permission.Id,
                        rp.Permission.Code,
                        rp.Permission.Name,
                        rp.Permission.Description,
                        rp.Permission.Module,
                        rp.Permission.IsActive,
                        rp.Permission.CreatedAt,
                        rp.Permission.UpdatedAt
                    )).ToList()
            ))
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsByIdAsync(Guid id, CancellationToken cancellationToken) {
        return _dbContext.Roles.AnyAsync(r => r.Id == id, cancellationToken);
    }
}
