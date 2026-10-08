using SmartHire.Application.Abstractions.Persistence.ReadModels;
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
    
    Task<CurrentAccountData?> GetCurrentAccountAsync(Guid userId, CancellationToken cancellationToken);
    
    Task<User?> GetByIdAsync(
        Guid userId,
        CancellationToken cancellationToken
    );
    
    Task<bool> PhoneExistsForOtherUserAsync(
        string normalizedPhone,
        Guid currentUserId,
        CancellationToken cancellationToken
    );
}