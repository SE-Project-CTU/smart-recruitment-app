using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Mapping;

public class JobPostingMapper {
    public static JobPostingResult ToResult(JobPosting jobPosting) => new(
        jobPosting.Id,
        jobPosting.CompanyId,
        jobPosting.CreatedBy,
        jobPosting.Title,
        jobPosting.ProvinceId,
        jobPosting.WardId,
        jobPosting.DetailedLocation,
        jobPosting.ExperienceYears,
        jobPosting.JobLevel is null ? null : ToApiValue(jobPosting.JobLevel.Value),
        jobPosting.EducationLevel is null
            ? string.Empty
            : ToApiValue(jobPosting.EducationLevel.Value),
        jobPosting.Vacancies,
        ToApiWorkMode(jobPosting.WorkMode),
        ToApiJobType(jobPosting.JobType),
        jobPosting.Description,
        jobPosting.Requirements,
        jobPosting.Benefits,
        jobPosting.SalaryMin,
        jobPosting.SalaryMax,
        jobPosting.SalaryNegotiable,
        jobPosting.Deadline,
        ToApiValue(jobPosting.Status),
        jobPosting.JobIndustries.Select(x => x.IndustryId).ToArray(),
        jobPosting.JobSkills.Select(x => x.SkillId).ToArray(),
        jobPosting.CreatedAt,
        jobPosting.UpdatedAt);
    
    private static string ToApiWorkMode(WorkMode value) => value switch {
        WorkMode.Remote => "REMOTE",
        WorkMode.Onsite => "ON_SITE",
        WorkMode.Hybrid => "HYBRID",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, null)
    };
    
    private static string ToApiJobType(JobType value) => value switch {
        JobType.FullTime => "FULL_TIME",
        JobType.PartTime => "PART_TIME",
        JobType.Contract => "CONTRACT",
        JobType.Internship => "INTERNSHIP",
        JobType.Freelance => "FREELANCE",
        _ => throw new ArgumentOutOfRangeException(nameof(value), value, null)
    };
    
    private static string ToApiValue<TEnum>(TEnum value) where TEnum : struct, Enum =>
        value.ToString().Select((character, index) =>
                index > 0 && char.IsUpper(character) ? $"_{character}" : character.ToString())
            .Aggregate(string.Empty, (result, part) => result + part)
            .ToUpperInvariant();
}