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
    
    public ICollection<CompanyInvitation> SendCompanyInvitations { get; private set; }
        = new List<CompanyInvitation>();
    
    public ICollection<CompanyJoinRequest> ReviewedCompanyJoinRequests { get; private set; }
        = new List<CompanyJoinRequest>();
    
    public ICollection<JobPosting> CreatedJobPostings { get; private set; }
        = new List<JobPosting>();
    
    private CompanyMembership() { }

    public static CompanyMembership Create(
        Guid companyId,
        Guid userId,
        CompanyMemberRole role,
        CompanyMembershipStatus status,
        DateTimeOffset joinedAt,
        DateTimeOffset now
    ) {
        if (companyId == Guid.Empty) {
            throw new ArgumentException("Company ID is required.", nameof(companyId));
        }
        if (userId == Guid.Empty) {
            throw new ArgumentException("User ID is required.", nameof(userId));
        }

        return new CompanyMembership {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            UserId = userId,
            Role = role,
            Status = status,
            JoinedAt = joinedAt,
            CreatedAt = now
        };
    }

    public void UpdateRole(CompanyMemberRole role) {
        Role = role;
    }

    public void UpdateStatus(CompanyMembershipStatus status) {
        Status = status;
    }
}