using Microsoft.EntityFrameworkCore;
using NpgsqlTypes;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Abstractions.Persistence.Criteria;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;
using SmartHire.Application.Features.Admin.JobPostings.DTOs;
using SmartHire.Application.Features.JobPostings.DTOs;
using JobPostingDetailData = SmartHire.Application.Abstractions.Persistence.ReadModels.JobPostingDetailData;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class JobPostingRepository : IJobPostingRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public JobPostingRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public async Task AddAsync(JobPosting jobPosting, CancellationToken cancellationToken) {
        await _dbContext.JobPostings.AddAsync(jobPosting, cancellationToken);
    }
    
    public async Task<(IReadOnlyList<JobPostingSearchData> Items, int TotalCount)> SearchPublicAsync(
        JobPostingSearchCriteria criteria,
        CancellationToken cancellationToken) {
        var query = _dbContext.JobPostings
            .AsNoTracking()
            .Where(posting => posting.Status == JobPostingStatus.Published &&
                              posting.Company.VerificationStatus == CompanyVerificationStatus.Verified &&
                              (posting.Deadline == null || posting.Deadline > criteria.Now));
        
        if (criteria.Filter.Keyword is not null) {
            var keyword = criteria.Filter.Keyword.Trim();
            query = query.Where(posting =>
                EF.Property<NpgsqlTsVector>(posting, "SearchVector")
                    .Matches(EF.Functions.PlainToTsQuery("simple", keyword))
                || EF.Functions.ILike(posting.Title, $"%{keyword}%")
                || EF.Functions.TrigramsWordSimilarity(keyword, posting.Title) > 0.4
            );
        }
        
        if (criteria.Filter.CompanyId is Guid companyId)
            query = query.Where(posting => posting.CompanyId == companyId);
        
        if (criteria.Filter.Company is not null) {
            var company = criteria.Filter.Company.Trim();
            query = query.Where(posting =>
                EF.Property<NpgsqlTsVector>(posting.Company, "SearchVector")
                    .Matches(EF.Functions.PlainToTsQuery("simple", company))
                || EF.Functions.ILike(posting.Company.Name, $"%{company}%")
                || EF.Functions.TrigramsWordSimilarity(company, posting.Company.Name) > 0.4);
        }
        
        if (criteria.Filter.ProvinceId is Guid provinceId)
            query = query.Where(posting => posting.ProvinceId == provinceId);
        if (criteria.Filter.WardId is Guid wardId)
            query = query.Where(posting => posting.WardId == wardId);
        if (criteria.Filter.JobLevel is { } jobLevel)
            query = query.Where(posting => posting.JobLevel == jobLevel);
        if (criteria.Filter.JobType is { } jobType)
            query = query.Where(posting => posting.JobType == jobType);
        if (criteria.Filter.WorkMode is { } workMode)
            query = query.Where(posting => posting.WorkMode == workMode);
        if (criteria.Filter.ExperienceYears is int experienceYears)
            query = query.Where(posting => posting.ExperienceYears == null ||
                                           posting.ExperienceYears <= experienceYears);
        
        if (criteria.Filter.IndustryIds.Count > 0) {
            var industryIds = criteria.Filter.IndustryIds.ToArray();
            query = query.Where(posting => posting.JobIndustries.Any(link => industryIds.Contains(link.IndustryId)));
        }
        
        if (criteria.Filter.ExperienceRanges.Count > 0) {
            var selectedRanges = JobExperienceRanges.All
                .Where(range =>
                    criteria.Filter.ExperienceRanges.Contains(range.Value, StringComparer.OrdinalIgnoreCase));
            var matchingYears = selectedRanges
                .SelectMany(range => Enumerable.Range(
                    range.MinYears,
                    range.MaxYears - range.MinYears + 1))
                .Distinct()
                .ToArray();

            query = query.Where(posting =>
                posting.ExperienceYears.HasValue &&
                matchingYears.Contains(posting.ExperienceYears.Value));
        }
        
        if (criteria.Filter.SalaryNegotiableOnly)
            query = query.Where(posting => posting.SalaryNegotiable);
        
        if (criteria.Filter.SalaryMin is decimal requestedMinimum)
            query = query.Where(posting => posting.SalaryMax == null ||
                                           posting.SalaryMax >= requestedMinimum);
        
        if (criteria.Filter.SalaryMax is decimal requestedMaximum)
            query = query.Where(posting => posting.SalaryMin == null ||
                                           posting.SalaryMin <= requestedMaximum);
        
        if (criteria.Filter.SalaryMin.HasValue || criteria.Filter.SalaryMax.HasValue)
            query = query.Where(posting => posting.SalaryMin != null || posting.SalaryMax != null);
        
        var totalCount = await query.CountAsync(cancellationToken);
        var ordered = ApplyOrdering(query, criteria.Sort.Sort, criteria.Sort.Direction);
        var items = await ordered
            .Skip(criteria.Pagination.Skip)
            .Take(criteria.Pagination.PageSize)
            .AsSplitQuery()
            .Select(posting => new JobPostingSearchData(
                posting.Id,
                new SearchJobCompanySummaryData(
                    posting.Company.Id,
                    posting.Company.Name,
                    posting.Company.LogoFile != null ? posting.Company.LogoFile.FileUrl : null),
                posting.Title,
                new SearchJobProvinceData(posting.Province.Id, posting.Province.Name),
                posting.Ward != null ? new SearchJobWardData(posting.Ward.Id, posting.Ward.Name) : null,
                posting.ExperienceYears,
                posting.JobLevel,
                posting.WorkMode,
                posting.JobType,
                posting.SalaryMin,
                posting.SalaryMax,
                posting.SalaryNegotiable,
                posting.Deadline,
                posting.Status,
                posting.JobSkills.Select(js => js.Skill.Name).ToList(),
                posting.JobIndustries.Select(ji => ji.Industry.Name).ToList(),
                posting.CreatedAt))
            .ToListAsync(cancellationToken);
        
        return (items, totalCount);
    }
    
    public async Task<JobPostingDetailData?> GetDetailByIdAsync(Guid id, CancellationToken cancellationToken) {
        return await _dbContext.JobPostings
            .AsNoTracking()
            .AsSplitQuery()
            .Where(p => p.Id == id)
            .Select(posting => new JobPostingDetailData(
                posting.Id,
                new CreatorReadModel(
                    posting.CreatedByMembership.User.Id,
                    posting.CreatedByMembership.User.FullName,
                    posting.CreatedByMembership.User.Email,
                    posting.CreatedByMembership.User.AvatarFile != null
                        ? posting.CreatedByMembership.User.AvatarFile.FileUrl
                        : posting.CreatedByMembership.User.ExternalAvatarUrl),
                posting.Title,
                posting.Description,
                posting.Requirements,
                posting.Benefits,
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
                new CompanyReadModel(
                    posting.Company.Id,
                    posting.Company.Name,
                    posting.Company.VerificationStatus,
                    posting.Company.Address,
                    posting.Company.LogoFile != null ? posting.Company.LogoFile.FileUrl : null),
                new LocationReadModel(
                    posting.ProvinceId,
                    posting.Province.Name,
                    posting.WardId,
                    posting.Ward != null ? posting.Ward.Name : null,
                    posting.DetailedLocation),
                posting.JobIndustries
                    .Select(ji => new IndustryReadModel(ji.Industry.Id, ji.Industry.Name))
                    .ToList(),
                posting.JobSkills
                    .Select(js => new SkillReadModel(js.Skill.Id, js.Skill.Name))
                    .ToList(),
                posting.CreatedAt,
                posting.UpdatedAt))
            .FirstOrDefaultAsync(cancellationToken);
    }
    
    public async Task<IReadOnlyList<JobPostingDetailData>> GetDetailsByIdsAsync(
        IEnumerable<Guid> ids,
        CancellationToken cancellationToken) {
        var idList = ids.Distinct().ToList();
        if (idList.Count == 0) return Array.Empty<JobPostingDetailData>();
        
        return await _dbContext.JobPostings
            .AsNoTracking()
            .AsSplitQuery()
            .Where(p => idList.Contains(p.Id))
            .Select(posting => new JobPostingDetailData(
                posting.Id,
                new CreatorReadModel(
                    posting.CreatedByMembership.User.Id,
                    posting.CreatedByMembership.User.FullName,
                    posting.CreatedByMembership.User.Email,
                    posting.CreatedByMembership.User.AvatarFile != null
                        ? posting.CreatedByMembership.User.AvatarFile.FileUrl
                        : posting.CreatedByMembership.User.ExternalAvatarUrl),
                posting.Title,
                posting.Description,
                posting.Requirements,
                posting.Benefits,
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
                new CompanyReadModel(
                    posting.Company.Id,
                    posting.Company.Name,
                    posting.Company.VerificationStatus,
                    posting.Company.Address,
                    posting.Company.LogoFile != null ? posting.Company.LogoFile.FileUrl : null),
                new LocationReadModel(
                    posting.ProvinceId,
                    posting.Province.Name,
                    posting.WardId,
                    posting.Ward != null ? posting.Ward.Name : null,
                    posting.DetailedLocation),
                posting.JobIndustries
                    .Select(ji => new IndustryReadModel(ji.Industry.Id, ji.Industry.Name))
                    .ToList(),
                posting.JobSkills
                    .Select(js => new SkillReadModel(js.Skill.Id, js.Skill.Name))
                    .ToList(),
                posting.CreatedAt,
                posting.UpdatedAt))
            .ToListAsync(cancellationToken);
    }
    
    public async Task<JobPosting?> GetForUpdateByIdAsync(Guid id, CancellationToken cancellationToken) {
        return await _dbContext.JobPostings
            .Include(p => p.JobIndustries)
            .Include(p => p.JobSkills)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }
    
    public Task<JobPosting?> GetForApplicationByIdAsync(Guid id, CancellationToken cancellationToken) {
        return _dbContext.JobPostings
            .AsNoTracking()
            .Include(posting => posting.Company)
            .SingleOrDefaultAsync(posting => posting.Id == id, cancellationToken);
    }
    
    public Task<Guid?> GetCompanyIdByIdAsync(Guid id, CancellationToken cancellationToken) {
        return _dbContext.JobPostings
            .AsNoTracking()
            .Where(posting => posting.Id == id)
            .Select(posting => (Guid?)posting.CompanyId)
            .SingleOrDefaultAsync(cancellationToken);
    }
    
    public async Task<IReadOnlyList<JobPosting>> GetPublishedOverduePostingsAsync(
        DateTimeOffset now,
        CancellationToken cancellationToken) {
        return await _dbContext.JobPostings
            .Where(p => p.Status == JobPostingStatus.Published &&
                        p.Deadline != null &&
                        p.Deadline <= now)
            .ToListAsync(cancellationToken);
    }
    
    public async Task<(IReadOnlyList<CompanyJobPostingData> Items, int TotalCount)> GetByCompanyIdPagedAsync(
        Guid companyId,
        JobPostingStatus? status,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.JobPostings
            .AsNoTracking()
            .Where(posting => posting.CompanyId == companyId);
        
        if (status.HasValue) {
            query = query.Where(posting => posting.Status == status.Value);
        }
        
        if (!string.IsNullOrWhiteSpace(search)) {
            var trimmed = search.Trim();
            query = query.Where(posting => EF.Functions.ILike(posting.Title, $"%{trimmed}%"));
        }
        
        var totalCount = await query.CountAsync(cancellationToken);
        
        var skip = Math.Max(0, (page - 1) * pageSize);
        var items = await query
            .OrderByDescending(posting => posting.CreatedAt)
            .ThenBy(posting => posting.Id)
            .Skip(skip)
            .Take(pageSize)
            .Select(posting => new CompanyJobPostingData(
                posting.Id,
                posting.Title,
                new CompanyJobPostingCompanyData(
                    posting.Company.Id,
                    posting.Company.Name),
                new CompanyJobPostingCreatorData(
                    posting.CreatedByMembership.User.Id,
                    posting.CreatedByMembership.User.FullName,
                    posting.CreatedByMembership.User.Email,
                    posting.CreatedByMembership.User.AvatarFile != null
                        ? posting.CreatedByMembership.User.AvatarFile.FileUrl
                        : posting.CreatedByMembership.User.ExternalAvatarUrl),
                new CompanyJobPostingProvinceData(
                    posting.Province.Id,
                    posting.Province.Name),
                posting.Ward != null
                    ? new CompanyJobPostingWardData(posting.Ward.Id, posting.Ward.Name)
                    : null,
                posting.DetailedLocation,
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
                posting.Applications.Count(),
                posting.CreatedAt,
                posting.UpdatedAt))
            .ToListAsync(cancellationToken);
        
        return (items, totalCount);
    }
    
    public async Task<(IReadOnlyList<AdminJobPostingItemDto> Items, int TotalCount)> GetAdminJobPostingsPagedAsync(
        string? search,
        JobPostingStatus? status,
        Guid? companyId,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.JobPostings.AsNoTracking();
        
        if (!string.IsNullOrWhiteSpace(search)) {
            var trimmed = search.Trim();
            query = query.Where(j =>
                EF.Functions.ILike(j.Title, "%" + trimmed + "%") ||
                EF.Functions.ILike(j.Company.Name, "%" + trimmed + "%"));
        }
        
        if (status.HasValue) {
            query = query.Where(j => j.Status == status.Value);
        }
        
        if (companyId.HasValue) {
            query = query.Where(j => j.CompanyId == companyId.Value);
        }
        
        var totalCount = await query.CountAsync(cancellationToken);
        
        var items = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new AdminJobPostingItemDto(
                j.Id,
                j.CompanyId,
                j.Company.Name,
                j.Company.LogoFile != null ? j.Company.LogoFile.FileUrl : null,
                j.CreatedBy,
                j.Title,
                j.Status.ToString().ToUpperInvariant(),
                j.Province.Name,
                j.Ward != null ? j.Ward.Name : null,
                j.Vacancies,
                j.SalaryMin,
                j.SalaryMax,
                j.SalaryNegotiable,
                j.Deadline,
                j.CreatedAt,
                j.UpdatedAt
            ))
            .ToListAsync(cancellationToken);
        
        return (items, totalCount);
    }
    
    public Task<JobPosting?> GetForModerationByIdAsync(Guid id, CancellationToken cancellationToken) {
        return _dbContext.JobPostings
            .Include(j => j.Company)
            .SingleOrDefaultAsync(j => j.Id == id, cancellationToken);
    }
    
    private static IOrderedQueryable<JobPosting> ApplyOrdering(
        IQueryable<JobPosting> query,
        JobPostingSortField sort,
        SortDirection direction) {
        if (sort == JobPostingSortField.SalaryMax) {
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
