using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobRecommendationRepository {
    Task<IReadOnlyList<JobRecommendation>> GetByCandidateIdAsync(
        Guid candidateId,
        decimal minScore,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<int> CountByCandidateIdAsync(
        Guid candidateId,
        decimal minScore,
        CancellationToken cancellationToken = default);

    Task<DateTimeOffset?> GetLatestGeneratedAtAsync(
        Guid candidateId,
        CancellationToken cancellationToken = default);

    Task UpsertRangeAsync(
        IReadOnlyList<JobRecommendation> recommendations,
        CancellationToken cancellationToken = default);
}
