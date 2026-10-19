using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Commands.CreateJobPosting;

internal static class CreateJobPostingCommandValidator {
    public static ValidatedCreateJobPosting Validate(
        CreateJobPostingCommand command,
        DateTimeOffset now) {
        var details = new List<AppErrorDetail>();
        
        if (command.CompanyId == Guid.Empty)
            details.Add(Required("companyId", "Company ID is required."));
        if (command.ProvinceId == Guid.Empty)
            details.Add(Required("provinceId", "Province ID is required."));
        
        var title = command.Title.Trim();
        ValidateLength(details, "title", title, 2, 200, "Title must contain between 2 and 200 characters.");
        
        if (command.ExperienceYears is null or < 0 or > 60)
            details.Add(Invalid("experienceYears", "Experience years must be between 0 and 60."));
        if (command.Vacancies is null or < 1)
            details.Add(Invalid("vacancies", "Vacancies must be greater than 0."));
        
        var description = command.Description.Trim();
        if (string.IsNullOrWhiteSpace(description) || description.Length < 20)
            details.Add(new AppErrorDetail("description", ValidationReasons.MinLength,
                "Description must contain at least 20 characters."));
        
        var requirements = command.Requirements.Trim();
        if (string.IsNullOrWhiteSpace(requirements) || requirements.Length < 20)
            details.Add(new AppErrorDetail("requirements", ValidationReasons.MinLength,
                "Requirements must contain at least 20 characters."));
        
        if (command.DetailedLocation is { } detailedLocation && detailedLocation.Trim().Length > 500)
            details.Add(new AppErrorDetail("detailedLocation", ValidationReasons.MaxLength,
                "Detailed location must not exceed 500 characters."));
        if (command.Benefits is { } benefits && benefits.Trim().Length > 10_000)
            details.Add(new AppErrorDetail("benefits", ValidationReasons.MaxLength,
                "Benefits must not exceed 10000 characters."));
        if (command.EducationLevel is { } education && education.Trim().Length > 150)
            details.Add(new AppErrorDetail("educationLevel", ValidationReasons.MaxLength,
                "Education level must not exceed 150 characters."));
        
        if (command.SalaryMin.HasValue && command.SalaryMin.Value < 0)
            details.Add(Invalid("salaryMin", "Salary minimum cannot be negative."));
        if (command.SalaryMax.HasValue && command.SalaryMax.Value < 0)
            details.Add(Invalid("salaryMax", "Salary maximum cannot be negative."));
        if (command.SalaryMin.HasValue && command.SalaryMax.HasValue &&
            command.SalaryMin.Value > command.SalaryMax.Value)
            details.Add(Invalid("salaryMin", "Salary minimum must not exceed salary maximum."));
        
        if (command.SalaryNegotiable is null)
            details.Add(Required("salaryNegotiable", "Salary negotiable flag is required."));
        if (command.Deadline is null)
            details.Add(Required("deadline", "Deadline is required."));
        else if (command.Deadline.Value.Offset != TimeSpan.Zero)
            details.Add(Invalid("deadline", "Deadline must be provided in UTC."));
        else if (command.Deadline.Value <= now)
            details.Add(Invalid("deadline", "Deadline must be later than the current time."));
        
        var jobLevel = ParseApiEnum<JobLevel>(command.JobLevel, "jobLevel", details);
        var educationLevel = ParseApiEnum<EducationLevel>(
            command.EducationLevel, "educationLevel", details);
        
        // The existing domain names these dimensions oppositely to the API contract:
        // API workMode is employment type; domain JobType stores that value.
        var domainJobType = ParseApiEnum<JobType>(command.JobType, "jobType", details);
        // API jobType is work location; domain WorkMode stores Remote/Onsite/Hybrid.
        var domainWorkMode = ParseApiEnum<WorkMode>(command.WorkMode, "workMode", details);
        
        var industryIds = command.IndustryIds ?? Array.Empty<Guid>();
        if (industryIds.Count == 0)
            details.Add(Required("industryIds", "At least one industry is required."));
        if (industryIds.Any(id => id == Guid.Empty))
            details.Add(Invalid("industryIds", "Industry IDs must be valid UUIDs."));
        if (industryIds.Distinct().Count() != industryIds.Count)
            details.Add(Invalid("industryIds", "Industry IDs must not contain duplicates."));
        
        var skillIds = command.SkillIds ?? Array.Empty<Guid>();
        if (skillIds.Count == 0)
            details.Add(Invalid("skillIds", "At least one skill is required."));
        if (skillIds.Any(id => id == Guid.Empty))
            details.Add(Invalid("skillIds", "Skill IDs must be valid UUIDs."));
        if (skillIds.Distinct().Count() != skillIds.Count)
            details.Add(Invalid("skillIds", "Skill IDs must not contain duplicates."));
        
        if (details.Count > 0)
            throw JobPostingExceptions.Validation(details);
        
        return new ValidatedCreateJobPosting(
            title!,
            command.ExperienceYears!.Value,
            jobLevel!.Value,
            educationLevel!.Value,
            command.Vacancies!.Value,
            domainWorkMode!.Value,
            domainJobType!.Value,
            description!,
            requirements!,
            string.IsNullOrWhiteSpace(command.Benefits) ? null : command.Benefits.Trim(),
            command.SalaryMin,
            command.SalaryMax,
            command.SalaryNegotiable!.Value,
            command.Deadline!.Value,
            industryIds,
            skillIds,
            string.IsNullOrWhiteSpace(command.DetailedLocation) ? null : command.DetailedLocation.Trim());
    }
    
    private static TEnum? ParseApiEnum<TEnum>(string? value, string field, ICollection<AppErrorDetail> details)
        where TEnum : struct, Enum {
        var normalized = value?.Trim().Replace("_", string.Empty).Replace("-", string.Empty).Replace(" ", string.Empty);
        if (!string.IsNullOrWhiteSpace(normalized) &&
            Enum.TryParse<TEnum>(normalized, true, out var parsed) &&
            Enum.IsDefined(parsed)) {
            return parsed;
        }
        
        details.Add(Invalid(field, $"{field} contains an unsupported value."));
        return null;
    }
    
    private static void ValidateLength(
        ICollection<AppErrorDetail> details,
        string field,
        string? value,
        int min,
        int max,
        string message) {
        if (string.IsNullOrWhiteSpace(value) || value.Length < min)
            details.Add(new AppErrorDetail(field, ValidationReasons.MinLength, message));
        else if (value.Length > max)
            details.Add(new AppErrorDetail(field, ValidationReasons.MaxLength, message));
    }
    
    private static AppErrorDetail Required(string field, string message) =>
        new(field, ValidationReasons.Required, message);
    
    private static AppErrorDetail Invalid(string field, string message) =>
        new(field, ValidationReasons.InvalidFormat, message);
}

internal sealed record ValidatedCreateJobPosting(
    string Title,
    int ExperienceYears,
    JobLevel JobLevel,
    EducationLevel EducationLevel,
    int Vacancies,
    WorkMode DomainWorkMode,
    JobType DomainJobType,
    string Description,
    string Requirements,
    string? Benefits,
    decimal? SalaryMin,
    decimal? SalaryMax,
    bool SalaryNegotiable,
    DateTimeOffset Deadline,
    IReadOnlyList<Guid> IndustryIds,
    IReadOnlyList<Guid> SkillIds,
    string? DetailedLocation);