using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;
using SmartHire.Application.Abstractions.Persistence.Criteria;
using SmartHire.Application.Abstractions.Persistence.ReadModels;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobPostingRepository
{
    Task AddAsync(JobPosting jobPosting, CancellationToken cancellationToken);

    Task<(IReadOnlyList<JobPostingSearchData> Items, int TotalCount)> SearchPublicAsync(
        JobPostingSearchCriteria criteria,
        CancellationToken cancellationToken);

    Task<JobPostingDetailData?> GetDetailByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<JobPosting?> GetForUpdateByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<JobPosting?> GetForApplicationByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<Guid?> GetCompanyIdByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<IReadOnlyList<JobPosting>> GetPublishedOverduePostingsAsync(DateTimeOffset now, CancellationToken cancellationToken);

    Task<(IReadOnlyList<CompanyJobPostingData> Items, int TotalCount)> GetByCompanyIdPagedAsync(
        Guid companyId,
        JobPostingStatus? status,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
}
