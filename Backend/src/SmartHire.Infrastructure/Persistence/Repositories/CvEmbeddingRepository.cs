using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class CvEmbeddingRepository : ICvEmbeddingRepository {
    private readonly SmartHireDbContext _dbContext;

    public CvEmbeddingRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    public async Task<CvEmbedding?> GetByCvVersionIdAsync(Guid cvVersionId, CancellationToken cancellationToken = default) {
        return await _dbContext.CvEmbeddings
            .Include(e => e.CvVersion)
                .ThenInclude(v => v.Cv)
            .SingleOrDefaultAsync(e => e.CvVersionId == cvVersionId, cancellationToken);
    }

    public async Task<IReadOnlyList<CvEmbedding>> GetByCandidateIdAsync(Guid candidateId, CancellationToken cancellationToken = default) {
        return await _dbContext.CvEmbeddings
            .AsNoTracking()
            .Include(e => e.CvVersion)
                .ThenInclude(v => v.Cv)
            .Where(e => e.CvVersion.Cv.CandidateId == candidateId && e.CvVersion.Cv.DeletedAt == null)
            .ToListAsync(cancellationToken);
    }

    public async Task UpsertAsync(CvEmbedding embedding, CancellationToken cancellationToken = default) {
        var existing = await _dbContext.CvEmbeddings
            .SingleOrDefaultAsync(e => e.CvVersionId == embedding.CvVersionId, cancellationToken);

        if (existing != null) {
            existing.Update(embedding.Embedding, embedding.Model);
        } else {
            await _dbContext.CvEmbeddings.AddAsync(embedding, cancellationToken);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
