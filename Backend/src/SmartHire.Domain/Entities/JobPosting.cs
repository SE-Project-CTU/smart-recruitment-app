namespace SmartHire.Domain.Entities;

using Enums;

public class JobPosting {
    public Guid Id { get; private set; }
    
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    
    public Guid CreatedBy { get; private set; }
    public CompanyMembership CreatedByMembership { get; private set; } = null!;
    
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    
    public Guid ProvinceId { get; private set; }
    public Province Province { get; private set; } = null!;
    
    public Guid? WardId { get; private set; }
    public Ward? Ward { get; private set; }
    
    public int Vacancies { get; private set; }
    
    public decimal? SalaryMin { get; private set; }
    public decimal? SalaryMax { get; private set; }
    public bool SalaryNegotiable { get; private set; } = false;
    
    public DateTimeOffset? Deadline { get; private set; }
    public JobPostingStatus Status { get; private set; }
    
    public string? DetailedLocation { get; private set; }
    
    public int? ExperienceYears { get; private set; }
    public JobLevel? JobLevel { get; private set; }
    public EducationLevel? EducationLevel { get; private set; }
    
    public WorkMode WorkMode { get; private set; }
    public JobType JobType { get; private set; }
    
    public string Requirements { get; private set; } = string.Empty;
    public string Benefits { get; private set; } = string.Empty;
    
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    
    public ICollection<JobSkill> JobSkills { get; private set; } 
        = new List<JobSkill>();
    
    public ICollection<JobIndustry> JobIndustries { get; private set; }
        = new List<JobIndustry>();
    
    public JobEmbedding? Embedding { get; private set; }

    public ICollection<JobApplication> Applications { get; private set; } = new List<JobApplication>();
    public ICollection<JobRecommendation> Recommendations { get; private set; } = new List<JobRecommendation>();
    
    private JobPosting() { }

    public static JobPosting Create(
        Guid companyId,
        Guid createdBy,
        string title,
        Guid provinceId,
        Guid? wardId,
        string? detailedLocation,
        int experienceYears,
        JobLevel jobLevel,
        EducationLevel? educationLevel,
        int vacancies,
        WorkMode workMode,
        JobType jobType,
        string description,
        string requirements,
        string? benefits,
        decimal? salaryMin,
        decimal? salaryMax,
        bool salaryNegotiable,
        DateTimeOffset deadline,
        DateTimeOffset now) {
        if (companyId == Guid.Empty) {
            throw new ArgumentException("CompanyId is required.", nameof(companyId));
        }
        
        if (createdBy == Guid.Empty) {
            throw new ArgumentException("CreatedBy is required.", nameof(createdBy));
        }
        
        if (string.IsNullOrWhiteSpace(title)) {
            throw new ArgumentException("Title is required.", nameof(title));
        }
        
        if (vacancies <= 0) {
            throw new ArgumentOutOfRangeException(nameof(vacancies));
        }

        if (provinceId == Guid.Empty) {
            throw new ArgumentException("ProvinceId is required.", nameof(provinceId));
        }

        if (string.IsNullOrWhiteSpace(description)) {
            throw new ArgumentException("Description is required.", nameof(description));
        }

        if (string.IsNullOrWhiteSpace(requirements)) {
            throw new ArgumentException("Requirements are required.", nameof(requirements));
        }
        
        return new JobPosting {
            CompanyId = companyId,
            CreatedBy = createdBy,
            Title = title.Trim(),
            Description = description.Trim(),
            ProvinceId = provinceId,
            WardId = wardId,
            DetailedLocation = string.IsNullOrWhiteSpace(detailedLocation)
                ? null
                : detailedLocation.Trim(),
            ExperienceYears = experienceYears,
            JobLevel = jobLevel,
            EducationLevel = educationLevel,
            Vacancies = vacancies,
            WorkMode = workMode,
            JobType = jobType,
            Requirements = requirements.Trim(),
            Benefits = string.IsNullOrWhiteSpace(benefits) ? string.Empty : benefits.Trim(),
            SalaryMin = salaryMin,
            SalaryMax = salaryMax,
            SalaryNegotiable = salaryNegotiable,
            Deadline = deadline,
            Status = JobPostingStatus.PendingReview,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void AddIndustry(Guid industryId) {
        if (industryId == Guid.Empty) {
            throw new ArgumentException("IndustryId is required.", nameof(industryId));
        }

        if (JobIndustries.Any(x => x.IndustryId == industryId)) {
            return;
        }

        JobIndustries.Add(JobIndustry.Create(this, industryId));
    }

    public void AddSkill(Guid skillId) {
        if (skillId == Guid.Empty) {
            throw new ArgumentException("SkillId is required.", nameof(skillId));
        }

        if (JobSkills.Any(x => x.SkillId == skillId)) {
            return;
        }

        JobSkills.Add(JobSkill.Create(this, skillId));
    }
}
