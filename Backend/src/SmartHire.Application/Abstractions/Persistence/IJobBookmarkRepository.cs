using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobBookmarkRepository {
    Task<bool> ExistsAsync(Guid userId, Guid jobPostingId, CancellationToken cancellationToken);
    Task<JobBookmark?> GetAsync(Guid userId, Guid jobPostingId, CancellationToken cancellationToken);
    Task AddAsync(JobBookmark bookmark, CancellationToken cancellationToken);
    void Delete(JobBookmark bookmark);
    Task<(IReadOnlyList<BookmarkedJobResult> Items, int TotalCount)> GetMyBookmarkedJobsPagedAsync(
        Guid userId,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task<HashSet<Guid>> GetBookmarkedJobIdsAsync(
        Guid userId,
        IEnumerable<Guid> jobIds,
        CancellationToken cancellationToken);
}

