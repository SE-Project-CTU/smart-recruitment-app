using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ICvVersionRepository {
    Task Add(CvVersion cvVersion);
    Task<int> GetLatestVersionNumberAsync(Guid cvId, CancellationToken cancellationToken);
}
