using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class UserRepository : IUserRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public UserRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public Task<bool> EmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken) {
        return _dbContext.Users.AnyAsync(
            user => user.Email == normalizedEmail,
            cancellationToken
        );
    }
    
    public Task<bool> PhoneExistsAsync(string normalizedPhone, CancellationToken cancellationToken) {
        return _dbContext.Users.AnyAsync(
            user => user.Phone == normalizedPhone,
            cancellationToken
        );
    }
    
    public async Task AddAsync(User user, CancellationToken cancellationToken) {
        await _dbContext.Users.AddAsync(user, cancellationToken);
    }
    
    public Task SaveChangeAsync(CancellationToken cancellationToken) {
        return _dbContext.SaveChangesAsync(cancellationToken);
    }
    
    public async Task<User?> GetByEmailWithRolesAsync(string normalizedEmail, CancellationToken cancellationToken) {
        return await _dbContext.Users
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(
                user => user.Email == normalizedEmail,
                cancellationToken
            );
    }
    
    public Task<CurrentAccountData?> GetCurrentAccountAsync(Guid userId, CancellationToken cancellationToken) {
        return _dbContext.Users
            .Where(user => user.Id == userId)
            .Select(user => new CurrentAccountData(
                user.Id,
                user.Email,
                user.Phone,
                user.FullName,
                user.AvatarFile == null
                    ? null
                    : user.AvatarFile.FileUrl,
                user.UserRoles
                    .Select(userRole => userRole.Role.Name)
                    .ToList(),
                user.Status,
                user.CreatedAt,
                user.UpdatedAt
            ))
            .SingleOrDefaultAsync(cancellationToken);
    }
    
    public Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken) {
        return _dbContext.Users.SingleOrDefaultAsync(
            user => user.Id == userId,
            cancellationToken
        );
    }
    
    public Task<bool> PhoneExistsForOtherUserAsync(
        string normalizedPhone,
        Guid currentUserId,
        CancellationToken cancellationToken
    ) {
        return _dbContext.Users.AnyAsync(
            user => user.Id != currentUserId &&
                    user.Phone == normalizedPhone,
            cancellationToken
        );
    }
}
