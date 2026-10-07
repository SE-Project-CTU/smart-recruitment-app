using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Auth.Refresh;
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
    
    public async Task<RefreshTokenRotationData?> GetByHashAsync(string hash, CancellationToken cancellationToken) {
        return await _dbContext.RefreshTokens
            .Where(token => token.TokenHash == hash)
            .Select(token => new RefreshTokenRotationData(
                token.Id,
                token.UserId,
                token.ExpiresAt,
                token.RevokedAt,
                token.User.Status,
                token.User.Email,
                token.User.FullName,
                token.User.UserRoles
                    .Select(userRole => userRole.Role.Name)
                    .ToList()))
            .SingleOrDefaultAsync(cancellationToken);
    }
    
    public async Task<bool> TryRevokeForRefreshAsync(Guid id, DateTimeOffset now, CancellationToken cancellationToken) {
        var affectedRows = await _dbContext.RefreshTokens
            .Where(token => token.Id == id &&
                            token.RevokedAt == null &&
                            token.ExpiresAt > now
            )
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(token => token.RevokedAt, now),
                cancellationToken
            );
        
        return affectedRows == 1;
    }
    
    public async Task<int> RevokeAllUnrevokedByUserIdAsync(
        Guid userId,
        DateTimeOffset now,
        CancellationToken cancellationToken
    ) {
        return await _dbContext.RefreshTokens
            .Where(token => token.UserId == userId && token.RevokedAt == null)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(token => token.RevokedAt, now),
                cancellationToken
            );
    }
    
    public async Task<bool> TryRevokeAsync(Guid id, DateTimeOffset now, CancellationToken cancellationToken) {
        var affectedRows = await _dbContext.RefreshTokens
            .Where(token => token.Id == id && token.RevokedAt == null)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(token => token.RevokedAt, now),
                cancellationToken
            );
        
        return affectedRows == 1;
    }
}
