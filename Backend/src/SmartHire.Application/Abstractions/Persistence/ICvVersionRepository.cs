using SmartHire.Domain.Entities;
using SmartHire.Application.Features.Cv.Queries.GetCvVersions;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ICvVersionRepository {
    Task Add(CvVersion cvVersion);
    Task<int> GetLatestVersionNumberAsync(Guid cvId, CancellationToken cancellationToken);
    Task<int> CountByCvIdAsync(Guid cvId, CancellationToken cancellationToken);
    Task<List<CvVersionSummaryResult>> GetPageByCvIdAsync(
        Guid cvId,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
    Task<CvVersion?> GetByIdAsync(
        Guid cvId,
        Guid versionId,
        CancellationToken cancellationToken);
}
