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
            detailedLocation);
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
    string? DetailedLocation);
