using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IUserRoleRepository {
    Task<ICollection<UserRole>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken);
}