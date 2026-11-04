using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class AiMatchResultRepository : IAiMatchResultRepository {
    private readonly SmartHireDbContext _dbContext;

    public AiMatchResultRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    public async Task<AiMatchResult?> GetByApplicationIdAsync(Guid applicationId, CancellationToken cancellationToken = default) {
        return await _dbContext.AiMatchResults
            .AsNoTracking()
            .SingleOrDefaultAsync(r => r.ApplicationId == applicationId, cancellationToken);
    }

    public async Task<AiMatchResult?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) {
        return await _dbContext.AiMatchResults
            .AsNoTracking()
            .SingleOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task AddAsync(AiMatchResult matchResult, CancellationToken cancellationToken = default) {
        await _dbContext.AiMatchResults.AddAsync(matchResult, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}
