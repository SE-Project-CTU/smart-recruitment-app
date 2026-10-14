using System.ComponentModel.DataAnnotations;
using SmartHire.Domain.Enums;
using SmartHire.Domain.Validation;

namespace SmartHire.Domain.ValueObjects.Cv;

public sealed record CvContentDocument {
    public CvDocumentMetadata Metadata { get; init; } = new();
    public CvProfile Profile { get; init; } = new();
    public CvSections Sections { get; init; } = new();
}

public sealed record CvDocumentMetadata {
    public string Version { get; init; } = "1.0";
    public string TemplateCode { get; init; } = string.Empty;
    public CvLanguage Language { get; init; } = CvLanguage.Vietnamese;
    public DateTimeOffset UpdatedAt { get; init; }
}

public sealed record CvProfile {
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Full name must contain between 1 and 50 characters.")]
    public string FullName { get; init; } = string.Empty;
    
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Title must contain between 1 and 50 characters.")]
    public string Title { get; init; } = string.Empty;
    
    public string AvatarUrl { get; init; } = string.Empty;
    
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Email must contain between 1 and 50 characters.")]
    [EmailAddress(ErrorMessage = "Email format is invalid.")]
    public string Email { get; init; } = string.Empty;
    
    [StringLength(11, MinimumLength = 1, ErrorMessage = "Phone number must contain between 1 and 11 characters.")]
    [RegularExpression(RequestValidationPatterns.VietnamesePhone,
        ErrorMessage = "Phone must be a valid Vietnamese mobile number (0xxxxxxxxx or +84xxxxxxxxx).")]
    public string Phone { get; init; } = string.Empty;
    
    public string Dob { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Website { get; init; } = string.Empty;
    public string SocialLink { get; init; } = string.Empty;
}

public sealed record CvSections {
    public HashSet<string> Order { get; init; } = [];
    public CvTextSection Objective { get; init; } = new();
    public CvItemSection<CvExperienceItem> Experience { get; init; } = new();
    public CvItemSection<CvEducationItem> Education { get; init; } = new();
    public CvItemSection<CvSkillItem> Skills { get; init; } = new();
    public CvItemSection<CvProjectItem> Projects { get; init; } = new();
    public CvItemSection<CvCertificationItem> Certifications { get; init; } = new();
    public CvItemSection<CvAwardItem> Awards { get; init; } = new();
    public CvTextSection Interests { get; init; } = new();
    public CvTextSection AdditionalInfo { get; init; } = new();
}

public sealed record CvTextSection {
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Title must contain between 1 and 100 characters.")]
    public string Title { get; init; } = string.Empty;
    
    public bool Visible { get; init; } = true;
    public string Content { get; init; } = string.Empty;
}

public sealed record CvItemSection<TItem> {
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Title must contain between 1 and 100 characters.")]
    public string Title { get; init; } = string.Empty;
    
    public bool Visible { get; init; } = true;
    public List<TItem> Items { get; init; } = [];
}

public sealed record CvExperienceItem {
    public string Id { get; init; } = string.Empty;
    
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Company name must contain between 1 and 50 characters.")]
    public string Company { get; init; } = string.Empty;
    
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Position must contain between 1 and 50 characters.")]
    public string Position { get; init; } = string.Empty;
    
    public string? StartDate { get; init; }
    public string? EndDate { get; init; }
    public string Description { get; init; } = string.Empty;
}

public sealed record CvEducationItem {
    public string Id { get; init; } = string.Empty;
    
    [StringLength(100, MinimumLength = 1, ErrorMessage = "School name must contain between 1 and 100 characters.")]
    public string School { get; init; } = string.Empty;
    
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Title must contain between 1 and 100 characters.")]
    public string Title { get; init; } = string.Empty;
    
    public string? Start { get; init; }
    public string? End { get; init; }
    public string Details { get; init; } = string.Empty;
}

public sealed record CvSkillItem {
    public string Id { get; init; } = string.Empty;
    
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Skill name must contain between 1 and 100 characters.")]
    public string Name { get; init; } = string.Empty;
    
    public string Description { get; init; } = string.Empty;
}

public sealed record CvProjectItem {
    public string Id { get; init; } = string.Empty;
    
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Project name must contain between 1 and 100 characters.")]
    public string ProjectName { get; init; } = string.Empty;
    
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Role must contain between 1 and 50 characters.")]
    public string Role { get; init; } = string.Empty;
    
    public string? Start { get; init; }
    public string? End { get; init; }
    public string Description { get; init; } = string.Empty;
}

public sealed record CvCertificationItem {
    public string Id { get; init; } = string.Empty;
    
    [StringLength(100, MinimumLength = 1,
        ErrorMessage = "Certification name must contain between 1 and 100 characters.")]
    public string Name { get; init; } = string.Empty;
    
    public string? IssueDate { get; init; }
}

public sealed record CvAwardItem {
    public string Id { get; init; } = string.Empty;
    
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Award name must contain between 1 and 100 characters.")]
    public string AwardName { get; init; } = string.Empty;
    
    public string? Date { get; init; }
}