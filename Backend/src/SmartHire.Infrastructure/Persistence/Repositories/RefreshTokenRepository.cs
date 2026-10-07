using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class RefreshTokenRepository : IRefreshTokenRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public RefreshTokenRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public async Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken) {
        await _dbContext.RefreshTokens.AddAsync(refreshToken, cancellationToken);
    }
}