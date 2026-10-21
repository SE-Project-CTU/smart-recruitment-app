using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.Applications.Queries.ListMyApplications;
using SmartHire.Application.Features.Applications.Queries.ListApplicationsForJob;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobApplicationRepository {
    Task<bool> ExistsForCandidateAsync(Guid jobId, Guid candidateId, CancellationToken cancellationToken);
    Task<bool> IsUploadedCvFileInUseAsync(Guid fileId, CancellationToken cancellationToken);
    Task AddAsync(JobApplication application, CancellationToken cancellationToken);
    Task<int> CountMineAsync(Guid candidateId, ApplicationStatus? status, CancellationToken cancellationToken);
    Task<List<ApplicationListItemData>> GetMinePageAsync(
        Guid candidateId,
        ApplicationStatus? status,
        MyApplicationsSort sort,
        SortDirection direction,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
    Task<int> CountByJobIdAsync(Guid jobId, ApplicationStatus? status, CancellationToken cancellationToken);
    Task<List<ApplicationListItemData>> GetPageByJobIdAsync(
        Guid jobId,
        ApplicationStatus? status,
        JobApplicationsSort sort,
        SortDirection direction,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
}
