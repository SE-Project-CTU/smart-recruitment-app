using SmartHire.Application.Features.Admin.Rbac.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IRoleRepository {
    Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken);
    Task<Role?> GetByIdWithPermissionsAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<RoleWithPermissionsDto>> GetAllWithPermissionsAsync(CancellationToken cancellationToken);
    Task<bool> ExistsByIdAsync(Guid id, CancellationToken cancellationToken);
}
