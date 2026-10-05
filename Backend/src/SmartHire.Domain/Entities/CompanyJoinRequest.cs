using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class CompanyJoinRequest {
    public Guid Id { get; private set; }
    
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    
    public CompanyJoinRequestStatus Status { get; private set; }
    
    public Guid? ReviewedBy { get; private set; }
    public CompanyMembership? Reviewer { get; private set; }
    
    public DateTimeOffset? ReviewedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    
    private CompanyJoinRequest() { }
}