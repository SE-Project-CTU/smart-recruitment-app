using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ICvRepository {
    Task Add(Cv cv);
    Task<Cv> GetMyCvAsync(Guid candidateId, CancellationToken cancellationToken);
}