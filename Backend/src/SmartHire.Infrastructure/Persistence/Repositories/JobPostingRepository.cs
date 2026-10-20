using Microsoft.EntityFrameworkCore;
using NpgsqlTypes;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class JobPostingRepository : IJobPostingRepository
{
    private readonly SmartHireDbContext _dbContext;

    public JobPostingRepository(SmartHireDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(JobPosting jobPosting, CancellationToken cancellationToken)
    {
        await _dbContext.JobPostings.AddAsync(jobPosting, cancellationToken);
    }

    public async Task<(IReadOnlyList<JobPostingSearchData> Items, int TotalCount)> SearchPublicAsync(
        SearchJobPostingsCriteria criteria,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.JobPostings
            .AsNoTracking()
            .Where(posting => posting.Status == JobPostingStatus.Published &&
                              posting.Company.VerificationStatus == CompanyVerificationStatus.Verified &&
                              (posting.Deadline == null || posting.Deadline > criteria.Now));

        if (criteria.Keyword is not null)
        {
            query = query.Where(posting =>
                EF.Property<NpgsqlTsVector>(posting, "SearchVector")
                    .Matches(EF.Functions.PlainToTsQuery("simple", criteria.Keyword)));
        }

        if (criteria.Company is not null)
        {
            query = query.Where(posting =>
                EF.Property<NpgsqlTsVector>(posting.Company, "SearchVector")
                    .Matches(EF.Functions.PlainToTsQuery("simple", criteria.Company)));
        }

        if (criteria.ProvinceId is Guid provinceId)
            query = query.Where(posting => posting.ProvinceId == provinceId);
        if (criteria.WardId is Guid wardId)
            query = query.Where(posting => posting.WardId == wardId);
        if (criteria.JobLevel is { } jobLevel)
            query = query.Where(posting => posting.JobLevel == jobLevel);
        if (criteria.JobType is { } jobType)
            query = query.Where(posting => posting.JobType == jobType);
        if (criteria.WorkMode is { } workMode)
            query = query.Where(posting => posting.WorkMode == workMode);
        if (criteria.ExperienceYears is int experienceYears)
            query = query.Where(posting => posting.ExperienceYears == null ||
                                           posting.ExperienceYears <= experienceYears);

        if (criteria.SalaryMin is decimal requestedMinimum)
            query = query.Where(posting => posting.SalaryMax == null ||
                                           posting.SalaryMax >= requestedMinimum ||
                                           posting.SalaryNegotiable);
        if (criteria.SalaryMax is decimal requestedMaximum)
            query = query.Where(posting => posting.SalaryMin == null ||
                                           posting.SalaryMin <= requestedMaximum ||
                                           posting.SalaryNegotiable);

        var totalCount = await query.CountAsync(cancellationToken);
        var ordered = ApplyOrdering(query, criteria.Sort, criteria.Direction);
        var items = await ordered
            .Skip(criteria.Skip)
            .Take(criteria.PageSize)
            .Select(posting => new JobPostingSearchData(
                posting.Id,
                posting.CompanyId,
                posting.Company.Name,
                posting.Title,
                posting.ProvinceId,
                posting.WardId,
                posting.ExperienceYears,
                posting.JobLevel,
                posting.WorkMode,
                posting.JobType,
                posting.SalaryMin,
                posting.SalaryMax,
                posting.SalaryNegotiable,
                posting.Deadline,
                posting.Status,
                posting.CreatedAt))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    private static IOrderedQueryable<JobPosting> ApplyOrdering(
        IQueryable<JobPosting> query,
        SearchJobPostingsSort sort,
        SearchJobPostingsDirection direction)
    {
        if (sort == SearchJobPostingsSort.SalaryMax)
        {
            // Keep postings without a disclosed maximum salary last in both directions.
            return direction == SearchJobPostingsDirection.Asc
                ? query.OrderBy(posting => posting.SalaryMax == null)
                    .ThenBy(posting => posting.SalaryMax)
                    .ThenBy(posting => posting.Id)
                : query.OrderBy(posting => posting.SalaryMax == null)
                    .ThenByDescending(posting => posting.SalaryMax)
                    .ThenBy(posting => posting.Id);
        }

        return direction == SearchJobPostingsDirection.Asc
            ? query.OrderBy(posting => posting.CreatedAt).ThenBy(posting => posting.Id)
            : query.OrderByDescending(posting => posting.CreatedAt).ThenBy(posting => posting.Id);
    }
}
