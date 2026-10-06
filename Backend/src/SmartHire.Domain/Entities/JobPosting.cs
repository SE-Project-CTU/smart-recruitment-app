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
    public string? EducationLevel { get; private set; }
    
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
    
    public JobPosting(Guid companyId, Guid createdBy, string title, string description, int vacancies) {
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
        
        CompanyId = companyId;
        CreatedBy = createdBy;
        Title = title.Trim();
        Description = description?.Trim() ?? string.Empty;
        Vacancies = vacancies;
        
        Status = JobPostingStatus.Published;
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = CreatedAt;
    }
}
