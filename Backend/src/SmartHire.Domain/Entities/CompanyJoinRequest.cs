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

    public static CompanyJoinRequest Create(
        Guid companyId,
        Guid userId,
        DateTimeOffset now
    ) {
        if (companyId == Guid.Empty) {
            throw new ArgumentException("Company ID is required.", nameof(companyId));
        }
        if (userId == Guid.Empty) {
            throw new ArgumentException("User ID is required.", nameof(userId));
        }

        return new CompanyJoinRequest {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            UserId = userId,
            Status = CompanyJoinRequestStatus.Pending,
            ReviewedBy = null,
            ReviewedAt = null,
            CreatedAt = now
        };
    }

    public void Approve(Guid reviewerUserId, DateTimeOffset reviewedAt) {
        Status = CompanyJoinRequestStatus.Approved;
        ReviewedBy = reviewerUserId;
        ReviewedAt = reviewedAt;
    }

    public void Reject(Guid reviewerUserId, DateTimeOffset reviewedAt) {
        Status = CompanyJoinRequestStatus.Rejected;
        ReviewedBy = reviewerUserId;
        ReviewedAt = reviewedAt;
    }
}