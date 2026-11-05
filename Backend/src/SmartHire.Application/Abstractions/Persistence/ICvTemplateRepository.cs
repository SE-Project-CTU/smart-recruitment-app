using SmartHire.Application.Features.Admin.Catalogs.DTOs;
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

    // Admin methods
    Task<(IReadOnlyList<AdminCvTemplateItemDto> Items, int TotalCount)> GetAdminCvTemplatesPagedAsync(
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<CvTemplate?> GetAdminCvTemplateByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<bool> CodeExistsAsync(string code, Guid? excludeId, CancellationToken cancellationToken);
    Task AddCvTemplateAsync(CvTemplate template, CancellationToken cancellationToken);
    Task<bool> HasLinkedCvsAsync(Guid templateId, CancellationToken cancellationToken);
}
