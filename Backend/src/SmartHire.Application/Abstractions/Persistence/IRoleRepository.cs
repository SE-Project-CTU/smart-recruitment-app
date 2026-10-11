using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IRoleRepository {
    Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken);
}