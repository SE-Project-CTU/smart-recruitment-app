using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartHire.Api.Contracts.Requests;

public sealed class UpdateJobPostingRequest
{
    private string? _title;
    private Guid? _provinceId;
    private Guid? _wardId;
    private string? _detailedLocation;
    private int? _experienceYears;
    private string? _jobLevel;
    private string? _educationLevel;
    private int? _vacancies;
    private string? _workMode;
    private string? _jobType;
    private string? _description;
    private string? _requirements;
    private string? _benefits;
    private decimal? _salaryMin;
    private decimal? _salaryMax;
    private bool? _salaryNegotiable;
    private DateTimeOffset? _deadline;
    private IReadOnlyList<Guid>? _industryIds;
    private IReadOnlyList<Guid>? _skillIds;

    public string? Title
    {
        get => _title;
        init
        {
            _title = value;
            TitleProvided = true;
        }
    }
    [JsonIgnore] public bool TitleProvided { get; private set; }

    public Guid? ProvinceId
    {
        get => _provinceId;
        init
        {
            _provinceId = value;
            ProvinceIdProvided = true;
        }
    }
    [JsonIgnore] public bool ProvinceIdProvided { get; private set; }

    public Guid? WardId
    {
        get => _wardId;
        init
        {
            _wardId = value;
            WardIdProvided = true;
        }
    }
    [JsonIgnore] public bool WardIdProvided { get; private set; }

    public string? DetailedLocation
    {
        get => _detailedLocation;
        init
        {
            _detailedLocation = value;
            DetailedLocationProvided = true;
        }
    }
    [JsonIgnore] public bool DetailedLocationProvided { get; private set; }

    public int? ExperienceYears
    {
        get => _experienceYears;
        init
        {
            _experienceYears = value;
            ExperienceYearsProvided = true;
        }
    }
    [JsonIgnore] public bool ExperienceYearsProvided { get; private set; }

    public string? JobLevel
    {
        get => _jobLevel;
        init
        {
            _jobLevel = value;
            JobLevelProvided = true;
        }
    }
    [JsonIgnore] public bool JobLevelProvided { get; private set; }

    public string? EducationLevel
    {
        get => _educationLevel;
        init
        {
            _educationLevel = value;
            EducationLevelProvided = true;
        }
    }
    [JsonIgnore] public bool EducationLevelProvided { get; private set; }

    public int? Vacancies
    {
        get => _vacancies;
        init
        {
            _vacancies = value;
            VacanciesProvided = true;
        }
    }
    [JsonIgnore] public bool VacanciesProvided { get; private set; }

    public string? WorkMode
    {
        get => _workMode;
        init
        {
            _workMode = value;
            WorkModeProvided = true;
        }
    }
    [JsonIgnore] public bool WorkModeProvided { get; private set; }

    public string? JobType
    {
        get => _jobType;
        init
        {
            _jobType = value;
            JobTypeProvided = true;
        }
    }
    [JsonIgnore] public bool JobTypeProvided { get; private set; }

    public string? Description
    {
        get => _description;
        init
        {
            _description = value;
            DescriptionProvided = true;
        }
    }
    [JsonIgnore] public bool DescriptionProvided { get; private set; }

    public string? Requirements
    {
        get => _requirements;
        init
        {
            _requirements = value;
            RequirementsProvided = true;
        }
    }
    [JsonIgnore] public bool RequirementsProvided { get; private set; }

    public string? Benefits
    {
        get => _benefits;
        init
        {
            _benefits = value;
            BenefitsProvided = true;
        }
    }
    [JsonIgnore] public bool BenefitsProvided { get; private set; }

    public decimal? SalaryMin
    {
        get => _salaryMin;
        init
        {
            _salaryMin = value;
            SalaryMinProvided = true;
        }
    }
    [JsonIgnore] public bool SalaryMinProvided { get; private set; }

    public decimal? SalaryMax
    {
        get => _salaryMax;
        init
        {
            _salaryMax = value;
            SalaryMaxProvided = true;
        }
    }
    [JsonIgnore] public bool SalaryMaxProvided { get; private set; }

    public bool? SalaryNegotiable
    {
        get => _salaryNegotiable;
        init
        {
            _salaryNegotiable = value;
            SalaryNegotiableProvided = true;
        }
    }
    [JsonIgnore] public bool SalaryNegotiableProvided { get; private set; }

    public DateTimeOffset? Deadline
    {
        get => _deadline;
        init
        {
            _deadline = value;
            DeadlineProvided = true;
        }
    }
    [JsonIgnore] public bool DeadlineProvided { get; private set; }

    public IReadOnlyList<Guid>? IndustryIds
    {
        get => _industryIds;
        init
        {
            _industryIds = value;
            IndustryIdsProvided = true;
        }
    }
    [JsonIgnore] public bool IndustryIdsProvided { get; private set; }

    public IReadOnlyList<Guid>? SkillIds
    {
        get => _skillIds;
        init
        {
            _skillIds = value;
            SkillIdsProvided = true;
        }
    }
    [JsonIgnore] public bool SkillIdsProvided { get; private set; }

    [JsonExtensionData]
    public Dictionary<string, JsonElement>? AdditionalFields { get; init; }
}
