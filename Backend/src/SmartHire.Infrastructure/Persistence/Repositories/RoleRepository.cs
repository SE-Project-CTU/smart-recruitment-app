using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class RoleRepository : IRoleRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public RoleRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public Task<Role?> GetByNameAsync(string name, CancellationToken cancellationToken) {
        return _dbContext.Roles.SingleOrDefaultAsync(
            role => role.Name == name,
            cancellationToken
        );
    }
}