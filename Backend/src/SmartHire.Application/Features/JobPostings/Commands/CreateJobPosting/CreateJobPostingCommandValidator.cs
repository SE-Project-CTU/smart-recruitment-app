using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Application.Features.JobPostings.Validation;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Commands.CreateJobPosting;

internal static class CreateJobPostingCommandValidator {
    public static ValidatedCreateJobPosting Validate(
        CreateJobPostingCommand command,
        DateTimeOffset now) {
        var details = new List<AppErrorDetail>();

        JobPostingValidator.ValidateGuid(command.CompanyId, "companyId", details, required: true);
        JobPostingValidator.ValidateGuid(command.ProvinceId, "provinceId", details, required: true);

        var title = JobPostingValidator.ValidateTitle(command.Title, details, required: true);
        var experienceYears = JobPostingValidator.ValidateExperienceYears(command.ExperienceYears, details, required: true);
        var vacancies = JobPostingValidator.ValidateVacancies(command.Vacancies, details, required: true);
        var description = JobPostingValidator.ValidateDescription(command.Description, details, required: true);
        var requirements = JobPostingValidator.ValidateRequirements(command.Requirements, details, required: true);
        var detailedLocation = JobPostingValidator.ValidateDetailedLocation(command.DetailedLocation, details);
        var benefits = JobPostingValidator.ValidateBenefits(command.Benefits, details);

        if (command.EducationLevel is { } education && education.Trim().Length > JobPostingValidator.EducationLevelMaxLength) {
            details.Add(new AppErrorDetail("educationLevel", ValidationReasons.MaxLength,
                $"Education level must not exceed {JobPostingValidator.EducationLevelMaxLength} characters."));
        }

        JobPostingValidator.ValidateSalaries(command.SalaryMin, command.SalaryMax, details);

        if (command.SalaryNegotiable is null) {
            details.Add(JobPostingValidator.Required("salaryNegotiable", "Salary negotiable flag is required."));
        }

        var deadline = JobPostingValidator.ValidateDeadline(command.Deadline, now, details, required: true);

        var jobLevel = JobPostingValidator.ParseApiEnum<JobLevel>(
            command.JobLevel, "jobLevel", details, required: true);
        var educationLevel = JobPostingValidator.ParseApiEnum<EducationLevel>(
            command.EducationLevel, "educationLevel", details, required: true);

        // API workMode is employment type; domain JobType stores that value.
        var domainJobType = JobPostingValidator.ParseApiEnum<JobType>(
            command.JobType, "jobType", details, required: true);
        // API jobType is work location; domain WorkMode stores Remote/Onsite/Hybrid.
        var domainWorkMode = JobPostingValidator.ParseApiEnum<WorkMode>(
            command.WorkMode, "workMode", details, required: true);

        var industryIds = JobPostingValidator.ValidateIndustryIds(command.IndustryIds, details, required: true) ?? Array.Empty<Guid>();
        var skillIds = JobPostingValidator.ValidateSkillIds(command.SkillIds, details, required: true) ?? Array.Empty<Guid>();

        decimal? s = command.SkillWeight;
        decimal? e = command.ExperienceWeight;
        decimal? t = command.TitleWeight;
        decimal? o = command.OtherWeight;
        if (s.HasValue || e.HasValue || t.HasValue || o.HasValue) {
            decimal sv = s ?? 0.40m;
            decimal ev = e ?? 0.25m;
            decimal tv = t ?? 0.25m;
            decimal ov = o ?? 0.10m;
            if (sv > 1.0m || ev > 1.0m || tv > 1.0m || ov > 1.0m) {
                sv /= 100m; ev /= 100m; tv /= 100m; ov /= 100m;
            }
            if (sv < 0 || ev < 0 || tv < 0 || ov < 0) {
                details.Add(new AppErrorDetail("matchingWeights", ValidationReasons.InvalidFormat, "Weights must be non-negative."));
            } else if (Math.Abs((sv + ev + tv + ov) - 1.0m) > 0.02m) {
                details.Add(new AppErrorDetail("matchingWeights", ValidationReasons.InvalidFormat, "Total weights must equal 100%."));
            }
            s = sv; e = ev; t = tv; o = ov;
        }

        if (details.Count > 0) {
            throw JobPostingExceptions.Validation(details);
        }

        return new ValidatedCreateJobPosting(
            title!,
            experienceYears!.Value,
            jobLevel!.Value,
            educationLevel!.Value,
            vacancies!.Value,
            domainWorkMode!.Value,
            domainJobType!.Value,
            description!,
            requirements!,
            benefits,
            command.SalaryMin,
            command.SalaryMax,
            command.SalaryNegotiable!.Value,
            deadline!.Value,
            industryIds,
            skillIds,
            detailedLocation,
            s,
            e,
            t,
            o);
    }
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
    string? DetailedLocation,
    decimal? SkillWeight = null,
    decimal? ExperienceWeight = null,
    decimal? TitleWeight = null,
    decimal? OtherWeight = null);
