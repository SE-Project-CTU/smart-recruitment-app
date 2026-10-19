using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class UserRoleRepository : IUserRoleRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public UserRoleRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public async Task<ICollection<UserRole>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken) {
        return await _dbContext.UserRoles
            .AsNoTracking()
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
            .ToListAsync(cancellationToken);
    }
}
