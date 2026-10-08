using SmartHire.Application.Features.Auth.Refresh;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IRefreshTokenRepository {
    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken);
    
    Task<RefreshTokenRotationData?> GetByHashAsync(string hash, CancellationToken cancellationToken);
    Task<bool> TryRevokeForRefreshAsync(Guid id, DateTimeOffset now, CancellationToken cancellationToken);
    Task<int> RevokeAllUnrevokedByUserIdAsync(Guid userId, DateTimeOffset now, CancellationToken cancellationToken);
    Task<bool> TryRevokeAsync(Guid id, DateTimeOffset now, CancellationToken cancellationToken);
}