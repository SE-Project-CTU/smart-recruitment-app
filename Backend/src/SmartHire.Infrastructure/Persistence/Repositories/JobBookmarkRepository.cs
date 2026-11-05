using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class JobBookmarkRepository : IJobBookmarkRepository {
    private readonly SmartHireDbContext _dbContext;

    public JobBookmarkRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    public Task<bool> ExistsAsync(Guid userId, Guid jobPostingId, CancellationToken cancellationToken) =>
        _dbContext.JobBookmarks.AsNoTracking()
            .AnyAsync(b => b.UserId == userId && b.JobPostingId == jobPostingId, cancellationToken);

    public async Task<JobBookmark?> GetAsync(Guid userId, Guid jobPostingId, CancellationToken cancellationToken) =>
        await _dbContext.JobBookmarks
            .FirstOrDefaultAsync(b => b.UserId == userId && b.JobPostingId == jobPostingId, cancellationToken);

    public async Task AddAsync(JobBookmark bookmark, CancellationToken cancellationToken) =>
        await _dbContext.JobBookmarks.AddAsync(bookmark, cancellationToken);

    public void Delete(JobBookmark bookmark) =>
        _dbContext.JobBookmarks.Remove(bookmark);

    public async Task<(IReadOnlyList<BookmarkedJobResult> Items, int TotalCount)> GetMyBookmarkedJobsPagedAsync(
        Guid userId,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.JobBookmarks
            .AsNoTracking()
            .Where(b => b.UserId == userId);

        if (!string.IsNullOrWhiteSpace(search)) {
            var trimmedSearch = search.Trim();
            query = query.Where(b =>
                EF.Functions.ILike(b.JobPosting.Title, $"%{trimmedSearch}%") ||
                EF.Functions.ILike(b.JobPosting.Company.Name, $"%{trimmedSearch}%"));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var rawItems = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new {
                BookmarkCreatedAt = b.CreatedAt,
                Posting = b.JobPosting,
                Company = b.JobPosting.Company,
                LogoUrl = b.JobPosting.Company.LogoFile != null ? b.JobPosting.Company.LogoFile.FileUrl : null,
                Province = b.JobPosting.Province,
                Ward = b.JobPosting.Ward,
                SkillNames = b.JobPosting.JobSkills.Select(s => s.Skill.Name).ToList(),
                IndustryNames = b.JobPosting.JobIndustries.Select(i => i.Industry.Name).ToList()
            })
            .ToListAsync(cancellationToken);

        var items = rawItems.Select(x => new BookmarkedJobResult(
            x.Posting.Id,
            new SearchJobCompanySummary(x.Company.Id, x.Company.Name, x.LogoUrl),
            x.Posting.Title,
            new SearchJobProvinceSummary(x.Province.Id, x.Province.Name),
            x.Ward != null ? new SearchJobWardSummary(x.Ward.Id, x.Ward.Name) : null,
            x.Posting.ExperienceYears,
            x.Posting.JobLevel != null ? ToCamelCase(x.Posting.JobLevel.Value.ToString()) : null,
            ToCamelCase(x.Posting.WorkMode.ToString()),
            ToCamelCase(x.Posting.JobType.ToString()),
            x.Posting.SalaryMin,
            x.Posting.SalaryMax,
            x.Posting.SalaryNegotiable,
            x.Posting.Deadline,
            x.Posting.Status == JobPostingStatus.Published ? "OPEN" : ToCamelCase(x.Posting.Status.ToString()),
            x.SkillNames,
            x.IndustryNames,
            x.Posting.CreatedAt,
            x.BookmarkCreatedAt,
            true
        )).ToList();

        return (items, totalCount);
    }

    public async Task<HashSet<Guid>> GetBookmarkedJobIdsAsync(
        Guid userId,
        IEnumerable<Guid> jobIds,
        CancellationToken cancellationToken) {
        var idList = jobIds.Distinct().ToList();
        if (idList.Count == 0) return [];

        var ids = await _dbContext.JobBookmarks
            .AsNoTracking()
            .Where(b => b.UserId == userId && idList.Contains(b.JobPostingId))
            .Select(b => b.JobPostingId)
            .ToListAsync(cancellationToken);

        return ids.ToHashSet();
    }

    private static string ToCamelCase(string value) =>
        value.Length == 0 ? value : char.ToLowerInvariant(value[0]) + value[1..];
}

