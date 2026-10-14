using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class CvVersionRepository : ICvVersionRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public CvVersionRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public Task Add(CvVersion cvVersion) {
        _dbContext.CvVersions.Add(cvVersion);
        return Task.CompletedTask;
    }

    public async Task<int> GetLatestVersionNumberAsync(
        Guid cvId,
        CancellationToken cancellationToken) {
        var latestVersionNumber = await _dbContext.CvVersions
            .Where(version => version.CvId == cvId)
            .Select(version => (int?)version.VersionNumber)
            .MaxAsync(cancellationToken);

        return latestVersionNumber ?? 0;
    }
}
