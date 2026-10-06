using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class CompanyInvitation {
    public Guid Id { get; private set; }
    
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    
    public Guid InviterId { get; private set; }
    public CompanyMembership Inviter { get; private set; } = null!;
    
    public Guid InviteeId { get; private set; }
    public User Invitee { get; private set; } = null!;
    
    public CompanyInvitationStatus Status { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    
    private CompanyInvitation() { }
}