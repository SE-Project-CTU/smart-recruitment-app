using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Application.Features.JobPostings.Validation;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Commands.UpdateJobPosting;

internal sealed record ValidatedUpdateJobPosting(
    Guid JobId,
    string? Title,
    Guid? ProvinceId,
    bool ProvinceIdProvided,
    Guid? WardId,
    bool WardIdProvided,
    string? DetailedLocation,
    bool DetailedLocationProvided,
    int? ExperienceYears,
    JobLevel? JobLevel,
    EducationLevel? EducationLevel,
    bool EducationLevelProvided,
    int? Vacancies,
    WorkMode? DomainWorkMode,
    JobType? DomainJobType,
    string? Description,
    string? Requirements,
    string? Benefits,
    bool BenefitsProvided,
    decimal? SalaryMin,
    bool SalaryMinProvided,
    decimal? SalaryMax,
    bool SalaryMaxProvided,
    bool? SalaryNegotiable,
    DateTimeOffset? Deadline,
    IReadOnlyList<Guid>? IndustryIds,
    bool IndustryIdsProvided,
    IReadOnlyList<Guid>? SkillIds,
    bool SkillIdsProvided);

internal static class UpdateJobPostingCommandValidator
{
    public static ValidatedUpdateJobPosting Validate(UpdateJobPostingCommand command, DateTimeOffset now)
    {
        var details = new List<AppErrorDetail>();

        if (!Guid.TryParse(command.RawJobId, out var jobId) || jobId == Guid.Empty)
        {
            throw JobPostingExceptions.InvalidJobPostingId();
        }

        var anyProvided = command.TitleProvided ||
                          command.ProvinceIdProvided ||
                          command.WardIdProvided ||
                          command.DetailedLocationProvided ||
                          command.ExperienceYearsProvided ||
                          command.JobLevelProvided ||
                          command.EducationLevelProvided ||
                          command.VacanciesProvided ||
                          command.WorkModeProvided ||
                          command.JobTypeProvided ||
                          command.DescriptionProvided ||
                          command.RequirementsProvided ||
                          command.BenefitsProvided ||
                          command.SalaryMinProvided ||
                          command.SalaryMaxProvided ||
                          command.SalaryNegotiableProvided ||
                          command.DeadlineProvided ||
                          command.IndustryIdsProvided ||
                          command.SkillIdsProvided;

        if (!anyProvided)
        {
            details.Add(new AppErrorDetail("body", ValidationReasons.Required,
                "At least one field must be provided for update."));
            throw JobPostingExceptions.Validation(details);
        }

        string? validatedTitle = null;
        if (command.TitleProvided)
        {
            validatedTitle = JobPostingValidator.ValidateTitle(command.Title, details, required: true);
        }

        if (command.ProvinceIdProvided)
        {
            JobPostingValidator.ValidateGuid(command.ProvinceId, "provinceId", details, required: true);
        }

        if (command.WardIdProvided && command.WardId.HasValue)
        {
            JobPostingValidator.ValidateGuid(command.WardId, "wardId", details, required: true);
        }

        string? validatedDetailedLocation = null;
        if (command.DetailedLocationProvided)
        {
            validatedDetailedLocation = JobPostingValidator.ValidateDetailedLocation(command.DetailedLocation, details);
        }

        int? validatedExperienceYears = null;
        if (command.ExperienceYearsProvided)
        {
            validatedExperienceYears = JobPostingValidator.ValidateExperienceYears(command.ExperienceYears, details, required: true);
        }

        int? validatedVacancies = null;
        if (command.VacanciesProvided)
        {
            validatedVacancies = JobPostingValidator.ValidateVacancies(command.Vacancies, details, required: true);
        }

        string? validatedDescription = null;
        if (command.DescriptionProvided)
        {
            validatedDescription = JobPostingValidator.ValidateDescription(command.Description, details, required: true);
        }

        string? validatedRequirements = null;
        if (command.RequirementsProvided)
        {
            validatedRequirements = JobPostingValidator.ValidateRequirements(command.Requirements, details, required: true);
        }

        string? validatedBenefits = null;
        if (command.BenefitsProvided)
        {
            validatedBenefits = JobPostingValidator.ValidateBenefits(command.Benefits, details);
        }

        EducationLevel? validatedEducationLevel = null;
        if (command.EducationLevelProvided)
        {
            if (!string.IsNullOrWhiteSpace(command.EducationLevel))
            {
                var trimmed = command.EducationLevel.Trim();
                if (trimmed.Length > JobPostingValidator.EducationLevelMaxLength)
                {
                    details.Add(new AppErrorDetail("educationLevel", ValidationReasons.MaxLength,
                        $"Education level must not exceed {JobPostingValidator.EducationLevelMaxLength} characters."));
                }
                validatedEducationLevel = JobPostingValidator.ParseApiEnum<EducationLevel>(
                    command.EducationLevel, "educationLevel", details, required: false);
            }
        }

        JobLevel? validatedJobLevel = null;
        if (command.JobLevelProvided)
        {
            validatedJobLevel = JobPostingValidator.ParseApiEnum<JobLevel>(
                command.JobLevel, "jobLevel", details, required: true);
        }

        // Mapping convention: API workMode -> domain JobType; API jobType -> domain WorkMode
        WorkMode? validatedDomainWorkMode = null;
        if (command.WorkModeProvided)
        {
            validatedDomainWorkMode = JobPostingValidator.ParseApiEnum<WorkMode>(
                command.WorkMode, "workMode", details, required: true);
        }

        JobType? validatedDomainJobType = null;
        if (command.JobTypeProvided)
        {
            validatedDomainJobType = JobPostingValidator.ParseApiEnum<JobType>(
                command.JobType, "jobType", details, required: true);
        }

        if (command.SalaryMinProvided || command.SalaryMaxProvided)
        {
            JobPostingValidator.ValidateSalaries(
                command.SalaryMinProvided ? command.SalaryMin : null,
                command.SalaryMaxProvided ? command.SalaryMax : null,
                details);
        }

        DateTimeOffset? validatedDeadline = null;
        if (command.DeadlineProvided)
        {
            validatedDeadline = JobPostingValidator.ValidateDeadline(command.Deadline, now, details, required: true);
        }

        IReadOnlyList<Guid>? validatedIndustryIds = null;
        if (command.IndustryIdsProvided)
        {
            if (command.IndustryIds is null)
            {
                details.Add(JobPostingValidator.Required("industryIds", "Industry IDs cannot be null."));
            }
            else
            {
                validatedIndustryIds = JobPostingValidator.ValidateIndustryIds(command.IndustryIds, details, required: false)?
                    .Distinct().ToArray();
            }
        }

        IReadOnlyList<Guid>? validatedSkillIds = null;
        if (command.SkillIdsProvided)
        {
            if (command.SkillIds is null)
            {
                details.Add(JobPostingValidator.Required("skillIds", "Skill IDs cannot be null."));
            }
            else
            {
                validatedSkillIds = JobPostingValidator.ValidateSkillIds(command.SkillIds, details, required: false)?
                    .Distinct().ToArray();
            }
        }

        if (details.Count > 0)
        {
            throw JobPostingExceptions.Validation(details);
        }

        return new ValidatedUpdateJobPosting(
            jobId,
            validatedTitle,
            command.ProvinceId,
            command.ProvinceIdProvided,
            command.WardId,
            command.WardIdProvided,
            validatedDetailedLocation,
            command.DetailedLocationProvided,
            validatedExperienceYears,
            validatedJobLevel,
            validatedEducationLevel,
            command.EducationLevelProvided,
            validatedVacancies,
            validatedDomainWorkMode,
            validatedDomainJobType,
            validatedDescription,
            validatedRequirements,
            validatedBenefits,
            command.BenefitsProvided,
            command.SalaryMin,
            command.SalaryMinProvided,
            command.SalaryMax,
            command.SalaryMaxProvided,
            command.SalaryNegotiable,
            validatedDeadline,
            validatedIndustryIds,
            command.IndustryIdsProvided,
            validatedSkillIds,
            command.SkillIdsProvided);
    }
}
