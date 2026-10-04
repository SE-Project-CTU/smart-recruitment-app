using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class Company {
    public Guid Id { get; private set; }
    
    public string Name { get; private set; } = string.Empty;
    public string TaxCode { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;
    public string Phone { get; private set; } = string.Empty;
    public string? Address { get; private set; }
    public string? Website { get; private set; }
    public string? Description { get; private set; }
    public Guid? LogoFileId { get; private set; }
    public MediaFile? LogoFile { get; private set; }
    
    public CompanyVerificationStatus VerificationStatus { get; private set; }
    public DateTimeOffset? VerifiedAt { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    
    public ICollection<CompanyMembership> Memberships { get; private set; }
        = new List<CompanyMembership>();
    
    public ICollection<CompanyJoinRequest> JoinRequests { get; private set; }
        = new List<CompanyJoinRequest>();
    
    public ICollection<CompanyInvitation> Invitations { get; private set; }
        = new List<CompanyInvitation>();
    
    public ICollection<CompanyFollow> Followers { get; private set; }
        = new List<CompanyFollow>();
    
    public ICollection<JobPosting> JobPostings { get; private set; }
        = new List<JobPosting>();
    
    
    private Company() { }
}
