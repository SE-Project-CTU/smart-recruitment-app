using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IAiMatchResultRepository {
    Task<AiMatchResult?> GetByApplicationIdAsync(Guid applicationId, CancellationToken cancellationToken = default);
    Task<AiMatchResult?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(AiMatchResult matchResult, CancellationToken cancellationToken = default);
}
