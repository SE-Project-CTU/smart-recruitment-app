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

    public static CompanyInvitation Create(
        Guid companyId,
        Guid inviterId,
        Guid inviteeId,
        DateTimeOffset expiresAt,
        DateTimeOffset now
    ) {
        if (companyId == Guid.Empty) {
            throw new ArgumentException("Company ID is required.", nameof(companyId));
        }
        if (inviterId == Guid.Empty) {
            throw new ArgumentException("Inviter ID is required.", nameof(inviterId));
        }
        if (inviteeId == Guid.Empty) {
            throw new ArgumentException("Invitee ID is required.", nameof(inviteeId));
        }
        if (expiresAt <= now) {
            throw new ArgumentException("Expiration date must be in the future.", nameof(expiresAt));
        }

        return new CompanyInvitation {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            InviterId = inviterId,
            InviteeId = inviteeId,
            Status = CompanyInvitationStatus.Pending,
            ExpiresAt = expiresAt,
            CreatedAt = now
        };
    }

    public void Accept() {
        Status = CompanyInvitationStatus.Accepted;
    }

    public void Reject() {
        Status = CompanyInvitationStatus.Rejected;
    }

    public void Expire() {
        Status = CompanyInvitationStatus.Expired;
    }
}