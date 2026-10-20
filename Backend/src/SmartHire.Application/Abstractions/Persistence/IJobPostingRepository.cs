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
}
