using SmartHire.Application.Features.Cv.Queries.GetMyCvs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ICvRepository {
    Task Add(Cv cv);
    Task<Cv?> GetCvByIdAsync(Guid cvId, CancellationToken cancellationToken);
    Task<Guid?> GetCandidateIdByCvIdAsync(Guid cvId, CancellationToken cancellationToken);
    Task<Cv?> GetForUpdateByIdAsync(Guid cvId, CancellationToken cancellationToken);
    
    Task<int> CountMineAsync(
        Guid candidateId,
        bool? isPublic,
        CvLanguage? language,
        CancellationToken cancellationToken);
    
    Task<List<CvListItemResult>> GetMinePageAsync(
        Guid candidateId,
        bool? isPublic,
        CvLanguage? language,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
}
