using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IUserRepository {
    Task<bool> EmailExistsAsync(
        string normalizedEmail,
        CancellationToken cancellationToken
    );
    
    Task<bool> PhoneExistsAsync(
        string normalizedPhone,
        CancellationToken cancellationToken
    );
    
    Task AddAsync(
        User user,
        CancellationToken cancellationToken
    );
    
    Task SaveChangeAsync(CancellationToken cancellationToken);
    
    Task<User?> GetByEmailWithRolesAsync(
        string normalizedEmail,
        CancellationToken cancellationToken
    );
}