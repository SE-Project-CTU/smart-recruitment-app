using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyJobPostingMapper {
    public static CompanyJobPostingResult ToResult(CompanyJobPostingData data) => new(
        data.Id,
        data.Title,
        new CompanyJobPostingCompanyResult(
            data.Company.Id,
            data.Company.Name),
        new CompanyJobPostingCreatorResult(
            data.Creator.Id,
            data.Creator.FullName,
            data.Creator.Email,
            data.Creator.AvatarUrl),
        new CompanyJobPostingProvinceResult(
            data.Province.Id,
            data.Province.Name),
        data.Ward is null
            ? null
            : new CompanyJobPostingWardResult(
                data.Ward.Id,
                data.Ward.Name),
        data.DetailedLocation,
        data.ExperienceYears,
        data.JobLevel is null ? null : ToApiValue(data.JobLevel.Value),
        data.EducationLevel is null ? null : ToApiValue(data.EducationLevel.Value),
        data.Vacancies,
        ToApiWorkMode(data.WorkMode),
        ToApiJobType(data.JobType),
        data.SalaryMin,
        data.SalaryMax,
        data.SalaryNegotiable,
        data.Deadline,
        ToApiValue(data.Status),
        data.TotalApplications,
        data.CreatedAt,
        data.UpdatedAt);

    private static string ToApiWorkMode(WorkMode value) => value switch {
        WorkMode.Remote => "REMOTE",
        WorkMode.Onsite => "ON_SITE",
        WorkMode.Hybrid => "HYBRID",
        _ => ToApiValue(value)
    };

    private static string ToApiJobType(JobType value) => value switch {
        JobType.FullTime => "FULL_TIME",
        JobType.PartTime => "PART_TIME",
        JobType.Contract => "CONTRACT",
        JobType.Internship => "INTERNSHIP",
        JobType.Freelance => "FREELANCE",
        _ => ToApiValue(value)
    };

    private static string ToApiValue<TEnum>(TEnum value) where TEnum : struct, Enum =>
        value.ToString().Select((character, index) =>
                index > 0 && char.IsUpper(character) ? $"_{character}" : character.ToString())
            .Aggregate(string.Empty, (result, part) => result + part)
            .ToUpperInvariant();
}
