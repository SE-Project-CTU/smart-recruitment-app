using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Admin.Users.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

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

    Task<User?> GetTrackedForGoogleAuthAsync(
        string firebaseUid,
        string normalizedEmail,
        CancellationToken cancellationToken
    );
    
    Task<CurrentAccountData?> GetCurrentAccountAsync(Guid userId, CancellationToken cancellationToken);
    
    Task<User?> GetByIdAsync(
        Guid userId,
        CancellationToken cancellationToken
    );

    Task<User?> GetByIdWithRolesAsync(
        Guid userId,
        CancellationToken cancellationToken
    );
    
    Task<bool> PhoneExistsForOtherUserAsync(
        string normalizedPhone,
        Guid currentUserId,
        CancellationToken cancellationToken
    );

    Task<(IReadOnlyList<AdminUserItemDto> Items, int TotalCount)> GetAdminUsersPagedAsync(
        string? search,
        string? role,
        UserStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken
    );

    Task<int> CountActiveAdminsAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<Guid>> GetActiveUserIdsByRoleAsync(
        string? role,
        CancellationToken cancellationToken
    );
}
