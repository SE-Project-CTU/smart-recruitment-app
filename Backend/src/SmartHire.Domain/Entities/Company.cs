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
    public string? LogoUrl { get; private set; }
    
    public CompanyVerificationStatus VerificationStatus { get; private set; }
    public DateTimeOffset? VerifiedAt { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    
    public ICollection<CompanyMembership> Memberships { get; private set; }
        = new List<CompanyMembership>();
    
    private Company() {}
}