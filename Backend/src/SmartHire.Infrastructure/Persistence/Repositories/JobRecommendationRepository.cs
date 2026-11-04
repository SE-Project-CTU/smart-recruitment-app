using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class JobRecommendationRepository : IJobRecommendationRepository {
    private readonly SmartHireDbContext _dbContext;

    public JobRecommendationRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<JobRecommendation>> GetByCandidateIdAsync(
        Guid candidateId,
        decimal minScore,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default) {
        var skip = (page - 1) * pageSize;

        return await _dbContext.JobRecommendations
            .AsNoTracking()
            .Include(r => r.Job)
                .ThenInclude(j => j.Company)
                    .ThenInclude(c => c.LogoFile)
            .Include(r => r.Job)
                .ThenInclude(j => j.Province)
            .Include(r => r.Job)
                .ThenInclude(j => j.Ward)
            .Where(r => r.CandidateId == candidateId && r.Score >= minScore)
            .OrderByDescending(r => r.Score)
            .ThenByDescending(r => r.GeneratedAt)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountByCandidateIdAsync(
        Guid candidateId,
        decimal minScore,
        CancellationToken cancellationToken = default) {
        return await _dbContext.JobRecommendations
            .AsNoTracking()
            .CountAsync(r => r.CandidateId == candidateId && r.Score >= minScore, cancellationToken);
    }

    public async Task<DateTimeOffset?> GetLatestGeneratedAtAsync(
        Guid candidateId,
        CancellationToken cancellationToken = default) {
        return await _dbContext.JobRecommendations
            .AsNoTracking()
            .Where(r => r.CandidateId == candidateId)
            .OrderByDescending(r => r.GeneratedAt)
            .Select(r => (DateTimeOffset?)r.GeneratedAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task UpsertRangeAsync(
        IReadOnlyList<JobRecommendation> recommendations,
        CancellationToken cancellationToken = default) {
        if (recommendations.Count == 0) return;

        var candidateId = recommendations[0].CandidateId;
        var incomingJobIds = recommendations.Select(r => r.JobId).ToList();

        var existing = await _dbContext.JobRecommendations
            .Where(r => r.CandidateId == candidateId && incomingJobIds.Contains(r.JobId))
            .ToListAsync(cancellationToken);

        var existingDict = existing.ToDictionary(r => r.JobId);

        foreach (var rec in recommendations) {
            if (existingDict.TryGetValue(rec.JobId, out var existingRec)) {
                existingRec.UpdateScore(rec.Score, rec.GeneratedAt);
            } else {
                await _dbContext.JobRecommendations.AddAsync(rec, cancellationToken);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
