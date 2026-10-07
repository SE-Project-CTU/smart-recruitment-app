using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
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
}