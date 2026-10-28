using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.Applications.Queries.ListMyApplications;
using SmartHire.Application.Features.Applications.Queries.ListApplicationsForJob;
using SmartHire.Application.Features.Companies.Queries.ListCompanyApplications;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobApplicationRepository {
    Task<bool> ExistsForCandidateAsync(Guid jobId, Guid candidateId, CancellationToken cancellationToken);
    Task<Guid?> GetApplicationIdForCandidateAsync(Guid jobId, Guid candidateId, CancellationToken cancellationToken);
    Task<bool> IsUploadedCvFileInUseAsync(Guid fileId, CancellationToken cancellationToken);
    Task AddAsync(JobApplication application, CancellationToken cancellationToken);
    Task<int> CountMineAsync(Guid candidateId, ApplicationStatus? status, CancellationToken cancellationToken);
    Task<List<MyApplicationListItemData>> GetMinePageAsync(
        Guid candidateId,
        ApplicationStatus? status,
        MyApplicationsSort sort,
        SortDirection direction,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
    Task<int> CountByJobIdAsync(Guid jobId, ApplicationStatus? status, CancellationToken cancellationToken);
    Task<ApplicationDetailData?> GetDetailByIdAsync(Guid applicationId, CancellationToken cancellationToken);
    Task<int> CountStatusHistoryAsync(Guid applicationId, CancellationToken cancellationToken);
    Task<List<ApplicationStatusHistoryData>> GetStatusHistoryPageAsync(
        Guid applicationId,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
    Task<JobApplication?> GetForStatusUpdateByIdAsync(Guid applicationId, CancellationToken cancellationToken);
    Task<List<JobApplicationListItemData>> GetPageByJobIdAsync(
        Guid jobId,
        ApplicationStatus? status,
        JobApplicationsSort sort,
        SortDirection direction,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
    Task<int> CountByCompanyIdAsync(
        Guid companyId,
        Guid? jobId,
        ApplicationStatus? status,
        string? search,
        CancellationToken cancellationToken);
    Task<List<CompanyApplicationListItemData>> GetPageByCompanyIdAsync(
        Guid companyId,
        Guid? jobId,
        ApplicationStatus? status,
        string? search,
        CompanyApplicationsSort sort,
        SortDirection direction,
        int skip,
        int pageSize,
        CancellationToken cancellationToken);
    Task<bool> CanRecruiterAccessCvVersionAsync(
        Guid cvId,
        Guid versionId,
        Guid recruiterUserId,
        CancellationToken cancellationToken);
}
