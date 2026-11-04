using SmartHire.Application.Features.Admin.Rbac.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IPermissionRepository {
    Task<Permission?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<Permission?> GetByCodeAsync(string code, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(string code, Guid? excludeId = null, CancellationToken cancellationToken = default);
    Task AddAsync(Permission permission, CancellationToken cancellationToken);
    Task<(IReadOnlyList<PermissionDto> Items, int TotalCount)> GetPermissionsPagedAsync(
        string? search,
        string? module,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task<bool> HasAssignedRolesAsync(Guid permissionId, CancellationToken cancellationToken);
    Task<List<Permission>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken cancellationToken);
}
