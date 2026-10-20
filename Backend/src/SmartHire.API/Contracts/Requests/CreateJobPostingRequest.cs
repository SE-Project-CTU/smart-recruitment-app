using System.ComponentModel.DataAnnotations;

namespace SmartHire.Api.Contracts.Requests;

public sealed class CreateJobPostingRequest {
    [Required(ErrorMessage = "Company ID is required.")]
    public Guid CompanyId { get; init; }
    
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(200, MinimumLength = 2, ErrorMessage = "Title must contain between 2 and 200 characters.")]
    public string Title { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Province ID is required.")]
    public Guid ProvinceId { get; init; }
    
    public Guid? WardId { get; init; }
    
    [StringLength(500, ErrorMessage = "Detailed location must not exceed 500 characters.")]
    public string? DetailedLocation { get; init; }
    
    [Required(ErrorMessage = "Experience years is required.")]
    [Range(0, 60, ErrorMessage = "Experience years must be between 0 and 60.")]
    public int? ExperienceYears { get; init; }
    
    [Required(ErrorMessage = "Job level is required.")]
    public string JobLevel { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Education level is required.")]
    [StringLength(150, ErrorMessage = "Education level must not exceed 150 characters.")]
    public string EducationLevel { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Vacancies is required.")]
    [Range(1, int.MaxValue, ErrorMessage = "Vacancies must be greater than 0.")]
    public int? Vacancies { get; init; }
    
    [Required(ErrorMessage = "Work mode is required.")]
    public string WorkMode { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Job type is required.")]
    public string JobType { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Description is required.")]
    [MinLength(20, ErrorMessage = "Description must contain at least 20 characters.")]
    public string Description { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "Requirements are required.")]
    [MinLength(20, ErrorMessage = "Requirements must contain at least 20 characters.")]
    public string Requirements { get; init; } = string.Empty;
    
    [StringLength(10000, ErrorMessage = "Benefits must not exceed 10000 characters.")]
    public string? Benefits { get; init; }
    
    [Range(typeof(decimal), "0", "79228162514264337593543950335", ErrorMessage = "Salary minimum cannot be negative.")]
    public decimal? SalaryMin { get; init; }
    
    [Range(typeof(decimal), "0", "79228162514264337593543950335", ErrorMessage = "Salary maximum cannot be negative.")]
    public decimal? SalaryMax { get; init; }
    
    [Required(ErrorMessage = "Salary negotiable flag is required.")]
    public bool? SalaryNegotiable { get; init; }
    
    [Required(ErrorMessage = "Deadline is required.")]
    public DateTimeOffset? Deadline { get; init; }
    
    [Required(ErrorMessage = "At least one industry is required.")]
    [MinLength(1, ErrorMessage = "At least one industry is required.")]
    public IReadOnlyList<Guid>? IndustryIds { get; init; }
    
    [Required(ErrorMessage = "At least one skill is required.")]
    [MinLength(1, ErrorMessage = "At least one skill is required.")]
    public IReadOnlyList<Guid>? SkillIds { get; init; }
}