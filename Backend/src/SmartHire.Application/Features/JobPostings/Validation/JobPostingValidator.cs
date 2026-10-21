using SmartHire.Application.Common.Errors;

namespace SmartHire.Application.Features.JobPostings.Validation;

/// <summary>
/// Shared normalization and validation rules for Job Posting fields.
/// </summary>
internal static class JobPostingValidator
{
    public const int TitleMinLength = 2;
    public const int TitleMaxLength = 200;
    public const int DescriptionMinLength = 20;
    public const int RequirementsMinLength = 20;
    public const int DetailedLocationMaxLength = 500;
    public const int EducationLevelMaxLength = 150;
    public const int BenefitsMaxLength = 10000;
    public const int ExperienceYearsMin = 0;
    public const int ExperienceYearsMax = 60;
    public const int VacanciesMin = 1;

    public static AppErrorDetail Invalid(string field, string message) =>
        new(field, ValidationReasons.InvalidFormat, message);

    public static AppErrorDetail Required(string field, string message) =>
        new(field, ValidationReasons.Required, message);

    public static TEnum? ParseApiEnum<TEnum>(
        string? value,
        string field,
        ICollection<AppErrorDetail> details,
        bool required = false)
        where TEnum : struct, Enum
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            if (required)
                details.Add(Invalid(field, $"{field} contains an unsupported value."));

            return null;
        }

        var normalized = value.Trim()
            .Replace("_", string.Empty)
            .Replace("-", string.Empty)
            .Replace(" ", string.Empty);

        var isNamedValue = Enum.GetNames<TEnum>()
            .Any(name => name.Equals(normalized, StringComparison.OrdinalIgnoreCase));

        if (isNamedValue &&
            Enum.TryParse<TEnum>(normalized, true, out var parsed) &&
            Enum.IsDefined(parsed))
            return parsed;

        details.Add(Invalid(field, $"{field} contains an unsupported value."));
        return null;
    }

    public static string? ValidateTitle(string? title, ICollection<AppErrorDetail> details, bool required = false)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            if (required)
                details.Add(Required("title", "Title is required."));
            return null;
        }

        var trimmed = title.Trim();
        if (trimmed.Length < TitleMinLength || trimmed.Length > TitleMaxLength)
        {
            details.Add(new AppErrorDetail("title", ValidationReasons.InvalidFormat,
                $"Title must contain between {TitleMinLength} and {TitleMaxLength} characters."));
        }

        return trimmed;
    }

    public static string? ValidateDescription(string? description, ICollection<AppErrorDetail> details, bool required = false)
    {
        if (string.IsNullOrWhiteSpace(description))
        {
            if (required)
                details.Add(Required("description", "Description is required."));
            return null;
        }

        var trimmed = description.Trim();
        if (trimmed.Length < DescriptionMinLength)
        {
            details.Add(new AppErrorDetail("description", ValidationReasons.MinLength,
                $"Description must contain at least {DescriptionMinLength} characters."));
        }

        return trimmed;
    }

    public static string? ValidateRequirements(string? requirements, ICollection<AppErrorDetail> details, bool required = false)
    {
        if (string.IsNullOrWhiteSpace(requirements))
        {
            if (required)
                details.Add(Required("requirements", "Requirements are required."));
            return null;
        }

        var trimmed = requirements.Trim();
        if (trimmed.Length < RequirementsMinLength)
        {
            details.Add(new AppErrorDetail("requirements", ValidationReasons.MinLength,
                $"Requirements must contain at least {RequirementsMinLength} characters."));
        }

        return trimmed;
    }

    public static string? ValidateDetailedLocation(string? detailedLocation, ICollection<AppErrorDetail> details)
    {
        if (detailedLocation is null)
            return null;

        var trimmed = detailedLocation.Trim();
        if (trimmed.Length > DetailedLocationMaxLength)
        {
            details.Add(new AppErrorDetail("detailedLocation", ValidationReasons.MaxLength,
                $"Detailed location must not exceed {DetailedLocationMaxLength} characters."));
        }

        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }

    public static string? ValidateBenefits(string? benefits, ICollection<AppErrorDetail> details)
    {
        if (benefits is null)
            return null;

        var trimmed = benefits.Trim();
        if (trimmed.Length > BenefitsMaxLength)
        {
            details.Add(new AppErrorDetail("benefits", ValidationReasons.MaxLength,
                $"Benefits must not exceed {BenefitsMaxLength} characters."));
        }

        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }

    public static int? ValidateExperienceYears(int? experienceYears, ICollection<AppErrorDetail> details, bool required = false)
    {
        if (!experienceYears.HasValue)
        {
            if (required)
                details.Add(Required("experienceYears", "Experience years is required."));
            return null;
        }

        if (experienceYears.Value < ExperienceYearsMin || experienceYears.Value > ExperienceYearsMax)
        {
            details.Add(Invalid("experienceYears", $"Experience years must be between {ExperienceYearsMin} and {ExperienceYearsMax}."));
        }

        return experienceYears;
    }

    public static int? ValidateVacancies(int? vacancies, ICollection<AppErrorDetail> details, bool required = false)
    {
        if (!vacancies.HasValue)
        {
            if (required)
                details.Add(Required("vacancies", "Vacancies is required."));
            return null;
        }

        if (vacancies.Value < VacanciesMin)
        {
            details.Add(Invalid("vacancies", "Vacancies must be greater than 0."));
        }

        return vacancies;
    }

    public static void ValidateSalaries(decimal? salaryMin, decimal? salaryMax, ICollection<AppErrorDetail> details)
    {
        if (salaryMin.HasValue && salaryMin.Value < 0)
        {
            details.Add(Invalid("salaryMin", "Salary minimum cannot be negative."));
        }

        if (salaryMax.HasValue && salaryMax.Value < 0)
        {
            details.Add(Invalid("salaryMax", "Salary maximum cannot be negative."));
        }

        if (salaryMin.HasValue && salaryMax.HasValue && salaryMin.Value > salaryMax.Value)
        {
            details.Add(Invalid("salaryMin", "Salary minimum must not exceed salary maximum."));
        }
    }

    public static DateTimeOffset? ValidateDeadline(DateTimeOffset? deadline, DateTimeOffset now, ICollection<AppErrorDetail> details, bool required = false)
    {
        if (!deadline.HasValue)
        {
            if (required)
                details.Add(Required("deadline", "Deadline is required."));
            return null;
        }

        if (deadline.Value.Offset != TimeSpan.Zero)
        {
            details.Add(Invalid("deadline", "Deadline must be provided in UTC."));
        }
        else if (deadline.Value <= now)
        {
            details.Add(Invalid("deadline", "Deadline must be later than the current time."));
        }

        return deadline;
    }

    public static IReadOnlyList<Guid>? ValidateIndustryIds(IReadOnlyList<Guid>? industryIds, ICollection<AppErrorDetail> details, bool required = false)
    {
        if (industryIds is null || industryIds.Count == 0)
        {
            if (required)
                details.Add(Required("industryIds", "At least one industry is required."));
            return industryIds;
        }

        if (industryIds.Any(id => id == Guid.Empty))
        {
            details.Add(Invalid("industryIds", "Industry IDs must be valid UUIDs."));
        }

        if (industryIds.Distinct().Count() != industryIds.Count)
        {
            details.Add(Invalid("industryIds", "Industry IDs must not contain duplicates."));
        }

        return industryIds;
    }

    public static IReadOnlyList<Guid>? ValidateSkillIds(IReadOnlyList<Guid>? skillIds, ICollection<AppErrorDetail> details, bool required = false)
    {
        if (skillIds is null || skillIds.Count == 0)
        {
            if (required)
                details.Add(Invalid("skillIds", "At least one skill is required."));
            return skillIds;
        }

        if (skillIds.Any(id => id == Guid.Empty))
        {
            details.Add(Invalid("skillIds", "Skill IDs must be valid UUIDs."));
        }

        if (skillIds.Distinct().Count() != skillIds.Count)
        {
            details.Add(Invalid("skillIds", "Skill IDs must not contain duplicates."));
        }

        return skillIds;
    }

    public static Guid? ValidateGuid(Guid? id, string field, ICollection<AppErrorDetail> details, bool required = false)
    {
        if (!id.HasValue || id.Value == Guid.Empty)
        {
            if (required)
            {
                var formattedName = char.ToUpperInvariant(field[0]) + field[1..];
                details.Add(Required(field, $"{formattedName} is required."));
            }
            return null;
        }

        return id;
    }
}
