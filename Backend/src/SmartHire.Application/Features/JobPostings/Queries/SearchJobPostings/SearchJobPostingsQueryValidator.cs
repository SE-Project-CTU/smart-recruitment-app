using SmartHire.Application.Abstractions.Persistence.Criteria;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Application.Features.JobPostings.Validation;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;

internal static class SearchJobPostingsQueryValidator {
    public static JobPostingSearchCriteria Validate(SearchJobPostingsQuery query) {
        var details = new List<AppErrorDetail>();
        var filter = query.Filter ?? new JobPostingSearchFilter();
        var sort = query.Sort ?? new JobPostingSearchSort();
        var pagination = query.Pagination ?? new PaginationParams();

        var keyword = PagedListQueryValidator.NormalizeSearch(filter.Keyword);
        var company = PagedListQueryValidator.NormalizeSearch(filter.Company);
        
        if (filter.CompanyId == Guid.Empty)
            details.Add(JobPostingValidator.Invalid("companyId", "Company ID must be a valid UUID."));
        if (filter.SalaryMin is < 0)
            details.Add(JobPostingValidator.Invalid("salaryMin", "Salary minimum cannot be negative."));
        if (filter.SalaryMax is < 0)
            details.Add(JobPostingValidator.Invalid("salaryMax", "Salary maximum cannot be negative."));
        if (filter.SalaryMin.HasValue && filter.SalaryMax.HasValue && filter.SalaryMin > filter.SalaryMax)
            details.Add(JobPostingValidator.Invalid("salaryMax", "Salary maximum must be greater than or equal to salary minimum."));
        if (filter.ProvinceId == Guid.Empty)
            details.Add(JobPostingValidator.Invalid("provinceId", "Province ID must be a valid UUID."));
        if (filter.WardId == Guid.Empty)
            details.Add(JobPostingValidator.Invalid("wardId", "Ward ID must be a valid UUID."));
        if (filter.ExperienceYears is < 0 or > 60)
            details.Add(JobPostingValidator.Invalid("experienceYears", "Experience years must be between 0 and 60."));
        var industryIds = (filter.IndustryIds ?? []).Distinct().ToArray();
        if (industryIds.Contains(Guid.Empty))
            details.Add(JobPostingValidator.Invalid("industryIds", "Industry IDs must be valid UUIDs."));
        var experienceRanges = (filter.ExperienceRanges ?? [])
            .Select(value => value?.Trim() ?? string.Empty)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
        if (experienceRanges.Any(value => !JobExperienceRanges.All.Any(range =>
                range.Value.Equals(value, StringComparison.OrdinalIgnoreCase))))
            details.Add(JobPostingValidator.Invalid("experienceRanges",
                $"Experience ranges must be {string.Join(", ", JobExperienceRanges.All.Select(range => range.Value))}."));
        if (filter.ExperienceYears.HasValue && experienceRanges.Length > 0)
            details.Add(JobPostingValidator.Invalid("experienceRanges", "Experience ranges cannot be combined with experience years."));
        if (filter.SalaryNegotiableOnly == true && (filter.SalaryMin.HasValue || filter.SalaryMax.HasValue))
            details.Add(JobPostingValidator.Invalid("salaryNegotiableOnly", "Negotiable salary cannot be combined with a salary range."));
        
        var jobLevel = JobPostingValidator.ParseApiEnum<JobLevel>(filter.JobLevel, "jobLevel", details);
        var jobType = JobPostingValidator.ParseApiEnum<JobType>(filter.JobType, "jobType", details);
        var workMode = JobPostingValidator.ParseApiEnum<WorkMode>(filter.WorkMode, "workMode", details);
        var parsedSort = ParseSort(sort.Sort, details);
        var parsedDirection = SortDirectionValidator.Parse(sort.Direction, details);
        
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        
        var skip = PagedListQueryValidator.CalculateSkip(page, pageSize);
        
        if (details.Count > 0)
            throw JobPostingExceptions.InvalidSearchCriteria(details);
        
        return new JobPostingSearchCriteria(
            new JobPostingSearchFilterCriteria(
                keyword,
                company,
                filter.CompanyId,
                filter.SalaryMin,
                filter.SalaryMax,
                filter.ProvinceId,
                filter.WardId,
                jobLevel,
                jobType,
                workMode,
                filter.ExperienceYears,
                industryIds,
                experienceRanges,
                filter.SalaryNegotiableOnly == true),
            new JobPostingSearchSortCriteria(parsedSort, parsedDirection),
            new PaginationCriteria(skip, pageSize),
            DateTimeOffset.UtcNow);
    }
    
    private static JobPostingSortField ParseSort(string? value, ICollection<AppErrorDetail> details) {
        if (string.IsNullOrWhiteSpace(value) || value.Equals("createdAt", StringComparison.OrdinalIgnoreCase))
            return JobPostingSortField.CreatedAt;
        if (value.Equals("salaryMax", StringComparison.OrdinalIgnoreCase))
            return JobPostingSortField.SalaryMax;
        
        details.Add(JobPostingValidator.Invalid("sort", "Sort must be 'createdAt' or 'salaryMax'."));
        return JobPostingSortField.CreatedAt;
    }
}
