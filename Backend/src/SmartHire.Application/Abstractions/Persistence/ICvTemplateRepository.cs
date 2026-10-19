using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ICvTemplateRepository {
    Task<CvTemplate?> GetByIdAsync(Guid id, bool tracking, CancellationToken cancellationToken);

    Task<CvTemplate?> GetActiveByIdAsync(Guid id, CancellationToken cancellationToken);
    
    Task<CvTemplate?> GetByCodeAsync(string code, bool tracking, CancellationToken cancellationToken);
    
    Task<int> CountActiveAsync(string? search, CancellationToken cancellationToken);
    
    Task<List<CvTemplate>> GetActivePageAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken
    );
}
