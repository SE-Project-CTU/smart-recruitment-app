using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Applications.Queries.ListMyApplications;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobApplicationRepository {
    Task<bool> ExistsForCandidateAsync(Guid jobId, Guid candidateId, CancellationToken cancellationToken);
    Task<bool> IsUploadedCvFileInUseAsync(Guid fileId, CancellationToken cancellationToken);
    Task AddAsync(JobApplication application, CancellationToken cancellationToken);
    Task<int> CountMineAsync(Guid candidateId, ApplicationStatus? status, CancellationToken cancellationToken);
    Task<List<MyApplicationListItemData>> GetMinePageAsync(
        Guid candidateId,
        ApplicationStatus? status,
        MyApplicationsSort sort,
        MyApplicationsDirection direction,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
}
