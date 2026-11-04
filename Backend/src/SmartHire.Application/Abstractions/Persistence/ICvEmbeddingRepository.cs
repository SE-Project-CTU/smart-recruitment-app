using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ICvEmbeddingRepository {
    Task<CvEmbedding?> GetByCvVersionIdAsync(Guid cvVersionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CvEmbedding>> GetByCandidateIdAsync(Guid candidateId, CancellationToken cancellationToken = default);
    Task UpsertAsync(CvEmbedding embedding, CancellationToken cancellationToken = default);
}
