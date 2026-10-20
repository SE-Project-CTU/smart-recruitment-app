using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Application.Features.JobPostings.Validation;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Queries.SearchJobPostings;

internal static class SearchJobPostingsQueryValidator {
    public static SearchJobPostingsCriteria Validate(SearchJobPostingsQuery query) {
        var details = new List<AppErrorDetail>();
        var keyword = PagedListQueryValidator.NormalizeSearch(query.Keyword);
        var company = PagedListQueryValidator.NormalizeSearch(query.Company);
        
        if (query.SalaryMin is < 0)
            details.Add(JobPostingValidator.Invalid("salaryMin", "Salary minimum cannot be negative."));
        if (query.SalaryMax is < 0)
            details.Add(JobPostingValidator.Invalid("salaryMax", "Salary maximum cannot be negative."));
        if (query.SalaryMin.HasValue && query.SalaryMax.HasValue && query.SalaryMin > query.SalaryMax)
            details.Add(JobPostingValidator.Invalid("salaryMax", "Salary maximum must be greater than or equal to salary minimum."));
        if (query.ProvinceId == Guid.Empty)
            details.Add(JobPostingValidator.Invalid("provinceId", "Province ID must be a valid UUID."));
        if (query.WardId == Guid.Empty)
            details.Add(JobPostingValidator.Invalid("wardId", "Ward ID must be a valid UUID."));
        if (query.ExperienceYears is < 0 or > 60)
            details.Add(JobPostingValidator.Invalid("experienceYears", "Experience years must be between 0 and 60."));
        
        var jobLevel = JobPostingValidator.ParseApiEnum<JobLevel>(query.JobLevel, "jobLevel", details);
        var jobType = JobPostingValidator.ParseApiEnum<JobType>(query.JobType, "jobType", details);
        var workMode = JobPostingValidator.ParseApiEnum<WorkMode>(query.WorkMode, "workMode", details);
        var sort = ParseSort(query.Sort, details);
        var direction = ParseDirection(query.Direction, details);
        
        var page = PagedListQueryValidator.ValidatePage(query.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(query.PageSize);
        
        var skip = PagedListQueryValidator.CalculateSkip(page, pageSize);
        
        if (details.Count > 0)
            throw JobPostingExceptions.InvalidSearchCriteria(details);
        
        return new SearchJobPostingsCriteria(
            keyword,
            company,
            query.SalaryMin,
            query.SalaryMax,
            query.ProvinceId,
            query.WardId,
            jobLevel,
            jobType,
            workMode,
            query.ExperienceYears,
            sort,
            direction,
            skip,
            query.PageSize,
            DateTimeOffset.UtcNow);
    }
    
    private static SearchJobPostingsSort ParseSort(string? value, ICollection<AppErrorDetail> details) {
        if (string.IsNullOrWhiteSpace(value) || value.Equals("createdAt", StringComparison.OrdinalIgnoreCase))
            return SearchJobPostingsSort.CreatedAt;
        if (value.Equals("salaryMax", StringComparison.OrdinalIgnoreCase))
            return SearchJobPostingsSort.SalaryMax;
        
        details.Add(JobPostingValidator.Invalid("sort", "Sort must be 'createdAt' or 'salaryMax'."));
        return SearchJobPostingsSort.CreatedAt;
    }
    
    private static SearchJobPostingsDirection ParseDirection(
        string? value,
        ICollection<AppErrorDetail> details) {
        if (string.IsNullOrWhiteSpace(value) || value.Equals("desc", StringComparison.OrdinalIgnoreCase))
            return SearchJobPostingsDirection.Desc;
        if (value.Equals("asc", StringComparison.OrdinalIgnoreCase))
            return SearchJobPostingsDirection.Asc;
        
        details.Add(JobPostingValidator.Invalid("direction", "Direction must be 'asc' or 'desc'."));
        return SearchJobPostingsDirection.Desc;
    }
    
}
