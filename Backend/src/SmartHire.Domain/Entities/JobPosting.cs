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

    public void Update(
        string? title,
        Guid? provinceId,
        Guid? wardId,
        bool wardIdProvided,
        string? detailedLocation,
        bool detailedLocationProvided,
        int? experienceYears,
        JobLevel? jobLevel,
        EducationLevel? educationLevel,
        bool educationLevelProvided,
        int? vacancies,
        WorkMode? workMode,
        JobType? jobType,
        string? description,
        string? requirements,
        string? benefits,
        bool benefitsProvided,
        decimal? salaryMin,
        bool salaryMinProvided,
        decimal? salaryMax,
        bool salaryMaxProvided,
        bool? salaryNegotiable,
        DateTimeOffset? deadline,
        DateTimeOffset now) {
        if (!string.IsNullOrWhiteSpace(title)) {
            Title = title.Trim();
        }

        if (provinceId.HasValue && provinceId.Value != Guid.Empty) {
            ProvinceId = provinceId.Value;
        }

        if (wardIdProvided) {
            WardId = wardId;
        }

        if (detailedLocationProvided) {
            DetailedLocation = string.IsNullOrWhiteSpace(detailedLocation) ? null : detailedLocation.Trim();
        }

        if (experienceYears.HasValue) {
            ExperienceYears = experienceYears.Value;
        }

        if (jobLevel.HasValue) {
            JobLevel = jobLevel.Value;
        }

        if (educationLevelProvided) {
            EducationLevel = educationLevel;
        }

        if (vacancies.HasValue) {
            Vacancies = vacancies.Value;
        }

        if (workMode.HasValue) {
            WorkMode = workMode.Value;
        }

        if (jobType.HasValue) {
            JobType = jobType.Value;
        }

        if (!string.IsNullOrWhiteSpace(description)) {
            Description = description.Trim();
        }

        if (!string.IsNullOrWhiteSpace(requirements)) {
            Requirements = requirements.Trim();
        }

        if (benefitsProvided) {
            Benefits = string.IsNullOrWhiteSpace(benefits) ? string.Empty : benefits.Trim();
        }

        if (salaryMinProvided) {
            SalaryMin = salaryMin;
        }

        if (salaryMaxProvided) {
            SalaryMax = salaryMax;
        }

        if (salaryNegotiable.HasValue) {
            SalaryNegotiable = salaryNegotiable.Value;
        }

        if (deadline.HasValue) {
            Deadline = deadline.Value;
        }

        UpdatedAt = now;
    }

    public void Close(DateTimeOffset now) {
        if (Status == JobPostingStatus.Closed || Status == JobPostingStatus.Expired) {
            throw new InvalidOperationException($"Cannot close a job posting that is already in '{Status}' status.");
        }
        Status = JobPostingStatus.Closed;
        UpdatedAt = now;
    }

    public void Expire(DateTimeOffset now) {
        if (Status != JobPostingStatus.Published) {
            return;
        }
        Status = JobPostingStatus.Expired;
        UpdatedAt = now;
    }

    public void UpdateIndustries(IEnumerable<Guid> industryIds) {
        var distinctIds = industryIds.Where(id => id != Guid.Empty).Distinct().ToHashSet();
        
        var toRemove = JobIndustries.Where(ji => !distinctIds.Contains(ji.IndustryId)).ToList();
        foreach (var item in toRemove) {
            JobIndustries.Remove(item);
        }

        var existingIds = JobIndustries.Select(ji => ji.IndustryId).ToHashSet();
        foreach (var industryId in distinctIds) {
            if (!existingIds.Contains(industryId)) {
                JobIndustries.Add(JobIndustry.Create(this, industryId));
            }
        }
    }

    public void UpdateSkills(IEnumerable<Guid> skillIds) {
        var distinctIds = skillIds.Where(id => id != Guid.Empty).Distinct().ToHashSet();

        var toRemove = JobSkills.Where(js => !distinctIds.Contains(js.SkillId)).ToList();
        foreach (var item in toRemove) {
            JobSkills.Remove(item);
        }

        var existingIds = JobSkills.Select(js => js.SkillId).ToHashSet();
        foreach (var skillId in distinctIds) {
            if (!existingIds.Contains(skillId)) {
                JobSkills.Add(JobSkill.Create(this, skillId));
            }
        }
    }
}
