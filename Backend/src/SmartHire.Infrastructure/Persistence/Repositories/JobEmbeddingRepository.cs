using Microsoft.EntityFrameworkCore;
using Pgvector;
using Pgvector.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class JobEmbeddingRepository : IJobEmbeddingRepository {
    private readonly SmartHireDbContext _dbContext;

    public JobEmbeddingRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    public async Task<JobEmbedding?> GetByJobIdAsync(Guid jobId, CancellationToken cancellationToken = default) {
        return await _dbContext.JobEmbeddings
            .SingleOrDefaultAsync(e => e.JobId == jobId, cancellationToken);
    }

    public async Task UpsertAsync(JobEmbedding embedding, CancellationToken cancellationToken = default) {
        var existing = await _dbContext.JobEmbeddings
            .SingleOrDefaultAsync(e => e.JobId == embedding.JobId, cancellationToken);

        if (existing != null) {
            existing.Update(embedding.Embedding!, embedding.Model);
        } else {
            await _dbContext.JobEmbeddings.AddAsync(embedding, cancellationToken);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<(Guid JobId, double Distance)>> FindTopSimilarJobsAsync(
        Vector cvEmbedding,
        int limit,
        CancellationToken cancellationToken = default) {
        var now = DateTimeOffset.UtcNow;

        var items = await _dbContext.JobEmbeddings
            .AsNoTracking()
            .Include(e => e.Job)
            .Where(e => e.Embedding != null &&
                        e.Job.Status == JobPostingStatus.Published &&
                        (e.Job.Deadline == null || e.Job.Deadline > now))
            .OrderBy(e => e.Embedding!.CosineDistance(cvEmbedding))
            .Select(e => new {
                e.JobId,
                Distance = e.Embedding!.CosineDistance(cvEmbedding)
            })
            .Take(limit)
            .ToListAsync(cancellationToken);

        return items.Select(x => (x.JobId, x.Distance)).ToList();
    }
}
