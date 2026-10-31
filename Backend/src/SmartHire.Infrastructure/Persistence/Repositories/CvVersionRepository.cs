using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Features.Cv.DTOs;

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

    public Task<int> CountByCvIdAsync(Guid cvId, CancellationToken cancellationToken) {
        return _dbContext.CvVersions
            .AsNoTracking()
            .CountAsync(version => version.CvId == cvId, cancellationToken);
    }

    public Task<List<CvVersionSummaryResult>> GetPageByCvIdAsync(
        Guid cvId,
        int skip,
        int pageSize,
        CancellationToken cancellationToken) {
        return _dbContext.CvVersions
            .AsNoTracking()
            .Where(version => version.CvId == cvId)
            .OrderByDescending(version => version.VersionNumber)
            .ThenByDescending(version => version.CreatedAt)
            .ThenBy(version => version.Id)
            .Select(version => new CvVersionSummaryResult(
                version.Id,
                version.CvId,
                version.VersionNumber,
                version.Language == SmartHire.Domain.Enums.CvLanguage.Vietnamese ? "vi" : "en",
                version.CreatedAt))
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<CvVersion?> GetByIdAsync(
        Guid cvId,
        Guid versionId,
        CancellationToken cancellationToken) {
        return _dbContext.CvVersions
            .AsNoTracking()
            .SingleOrDefaultAsync(
                version => version.CvId == cvId && version.Id == versionId,
                cancellationToken);
    }

    public Task<bool> IsOwnedByCandidateAsync(
        Guid versionId,
        Guid candidateId,
        CancellationToken cancellationToken) {
        return _dbContext.CvVersions
            .AsNoTracking()
            .AnyAsync(version => version.Id == versionId && version.Cv.CandidateId == candidateId,
                cancellationToken);
    }

    public Task<List<CvVersion>> GetOrphanedArchivedVersionsAsync(
        DateTimeOffset archivedBefore,
        int batchSize,
        CancellationToken cancellationToken) {
        return _dbContext.CvVersions
            .Include(version => version.Cv)
            .Where(version => version.Cv.DeletedAt != null && version.Cv.DeletedAt <= archivedBefore)
            .Where(version => !version.Applications.Any())
            .Take(batchSize)
            .ToListAsync(cancellationToken);
    }

    public void Delete(CvVersion version) {
        _dbContext.CvVersions.Remove(version);
    }
}
