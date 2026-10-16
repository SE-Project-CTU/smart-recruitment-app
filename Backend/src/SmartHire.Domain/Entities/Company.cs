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

    public static Company Create(
        string name,
        string taxCode,
        string email,
        string phone,
        string? address,
        string? website,
        string? description,
        Guid? logoFileId,
        DateTimeOffset now
    ) {
        if (string.IsNullOrWhiteSpace(name)) {
            throw new ArgumentException("Company name is required.", nameof(name));
        }
        if (string.IsNullOrWhiteSpace(taxCode)) {
            throw new ArgumentException("Tax code is required.", nameof(taxCode));
        }
        if (string.IsNullOrWhiteSpace(email)) {
            throw new ArgumentException("Email is required.", nameof(email));
        }
        if (string.IsNullOrWhiteSpace(phone)) {
            throw new ArgumentException("Phone is required.", nameof(phone));
        }

        return new Company {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            TaxCode = taxCode.Trim(),
            Email = email.Trim(),
            Phone = phone.Trim(),
            Address = string.IsNullOrWhiteSpace(address) ? null : address.Trim(),
            Website = string.IsNullOrWhiteSpace(website) ? null : website.Trim(),
            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim(),
            LogoFileId = logoFileId,
            VerificationStatus = CompanyVerificationStatus.Pending,
            VerifiedAt = null,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void UpdateProfile(
        string? name,
        string? email,
        string? phone,
        string? address,
        string? website,
        string? description,
        Guid? logoFileId,
        bool updateLogo,
        DateTimeOffset now
    ) {
        if (!string.IsNullOrWhiteSpace(name)) {
            Name = name.Trim();
        }
        if (!string.IsNullOrWhiteSpace(email)) {
            Email = email.Trim();
        }
        if (!string.IsNullOrWhiteSpace(phone)) {
            Phone = phone.Trim();
        }
        if (address is not null) {
            Address = string.IsNullOrWhiteSpace(address) ? null : address.Trim();
        }
        if (website is not null) {
            Website = string.IsNullOrWhiteSpace(website) ? null : website.Trim();
        }
        if (description is not null) {
            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        }
        if (updateLogo) {
            LogoFileId = logoFileId;
        }

        UpdatedAt = now;
    }

    public void SetVerificationStatus(
        CompanyVerificationStatus status,
        DateTimeOffset? verifiedAt,
        DateTimeOffset now
    ) {
        VerificationStatus = status;
        VerifiedAt = verifiedAt;
        UpdatedAt = now;
    }
}
