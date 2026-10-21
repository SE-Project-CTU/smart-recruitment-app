using Microsoft.EntityFrameworkCore;
using NpgsqlTypes;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;
using JobPostingDetailData = SmartHire.Application.Abstractions.Persistence.ReadModels.JobPostingDetailData;

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

    public async Task<JobPostingDetailData?> GetDetailByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        // Use AsSplitQuery to avoid Cartesian explosion from the two independent collections
        // (JobIndustries and JobSkills). EF Core issues separate queries per collection.
        var posting = await _dbContext.JobPostings
            .AsNoTracking()
            .AsSplitQuery()
            .Include(p => p.Company)
                .ThenInclude(c => c.LogoFile)
            .Include(p => p.Province)
            .Include(p => p.Ward)
            .Include(p => p.JobIndustries)
            .Include(p => p.JobSkills)
                .ThenInclude(js => js.Skill)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (posting is null)
            return null;

        var company = new CompanyReadModel(
            posting.Company.Id,
            posting.Company.Name,
            posting.Company.VerificationStatus,
            posting.Company.Address,
            posting.Company.LogoFile?.FileUrl);

        var location = new LocationReadModel(
            posting.ProvinceId,
            posting.Province.Name,
            posting.WardId,
            posting.Ward?.Name,
            posting.DetailedLocation);

        return new JobPostingDetailData(
            posting.Id,
            posting.CreatedBy,
            posting.Title,
            posting.Description,
            posting.Requirements,
            string.IsNullOrEmpty(posting.Benefits) ? null : posting.Benefits,
            posting.ExperienceYears,
            posting.JobLevel,
            posting.EducationLevel,
            posting.Vacancies,
            posting.WorkMode,
            posting.JobType,
            posting.SalaryMin,
            posting.SalaryMax,
            posting.SalaryNegotiable,
            posting.Deadline,
            posting.Status,
            company,
            location,
            posting.JobIndustries.Select(ji => ji.IndustryId).ToArray(),
            posting.JobSkills.Select(js => new SkillReadModel(js.Skill.Id, js.Skill.Name)).ToArray(),
            posting.CreatedAt,
            posting.UpdatedAt);
    }

    public async Task<JobPosting?> GetForUpdateByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _dbContext.JobPostings
            .Include(p => p.JobIndustries)
            .Include(p => p.JobSkills)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public Task<JobPosting?> GetForApplicationByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.JobPostings
            .AsNoTracking()
            .Include(posting => posting.Company)
            .SingleOrDefaultAsync(posting => posting.Id == id, cancellationToken);
    }

    public Task<Guid?> GetCompanyIdByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.JobPostings
            .AsNoTracking()
            .Where(posting => posting.Id == id)
            .Select(posting => (Guid?)posting.CompanyId)
            .SingleOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<JobPosting>> GetPublishedOverduePostingsAsync(
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        return await _dbContext.JobPostings
            .Where(p => p.Status == JobPostingStatus.Published &&
                        p.Deadline != null &&
                        p.Deadline <= now)
            .ToListAsync(cancellationToken);
    }

    private static IOrderedQueryable<JobPosting> ApplyOrdering(
        IQueryable<JobPosting> query,
        SearchJobPostingsSort sort,
        SortDirection direction)
    {
        if (sort == SearchJobPostingsSort.SalaryMax)
        {
            // Keep postings without a disclosed maximum salary last in both directions.
            return direction == SortDirection.Asc
                ? query.OrderBy(posting => posting.SalaryMax == null)
                    .ThenBy(posting => posting.SalaryMax)
                    .ThenBy(posting => posting.Id)
                : query.OrderBy(posting => posting.SalaryMax == null)
                    .ThenByDescending(posting => posting.SalaryMax)
                    .ThenBy(posting => posting.Id);
        }

        return direction == SortDirection.Asc
            ? query.OrderBy(posting => posting.CreatedAt).ThenBy(posting => posting.Id)
            : query.OrderByDescending(posting => posting.CreatedAt).ThenBy(posting => posting.Id);
    }
}
