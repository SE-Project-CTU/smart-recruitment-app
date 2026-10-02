using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class CompanyMembership {
    public Guid Id { get; private set; }
    
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    
    public CompanyMemberRole Role { get; private set; }
    public CompanyMembershipStatus Status { get; private set; }
    
    public DateTimeOffset JoinedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    
    private CompanyMembership() { }
}