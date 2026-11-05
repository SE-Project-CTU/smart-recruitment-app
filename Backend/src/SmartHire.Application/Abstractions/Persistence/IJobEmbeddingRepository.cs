using Pgvector;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobEmbeddingRepository {
    Task<JobEmbedding?> GetByJobIdAsync(Guid jobId, CancellationToken cancellationToken = default);
    Task UpsertAsync(JobEmbedding embedding, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<(Guid JobId, double Distance)>> FindTopSimilarJobsAsync(
        Vector cvEmbedding,
        int limit,
        CancellationToken cancellationToken = default);
}
