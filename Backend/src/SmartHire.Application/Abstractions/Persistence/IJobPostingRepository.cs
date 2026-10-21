using SmartHire.Domain.Entities;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobPostingRepository
{
    Task AddAsync(JobPosting jobPosting, CancellationToken cancellationToken);

    Task<(IReadOnlyList<JobPostingSearchData> Items, int TotalCount)> SearchPublicAsync(
        SearchJobPostingsCriteria criteria,
        CancellationToken cancellationToken);

    Task<JobPostingDetailData?> GetDetailByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<JobPosting?> GetForUpdateByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<JobPosting?> GetForApplicationByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<Guid?> GetCompanyIdByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<IReadOnlyList<JobPosting>> GetPublishedOverduePostingsAsync(DateTimeOffset now, CancellationToken cancellationToken);
}
