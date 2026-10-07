using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IRefreshTokenRepository {
    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken);
}