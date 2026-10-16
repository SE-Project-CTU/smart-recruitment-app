namespace SmartHire.Domain.Entities;

public class CompanyFollow {
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    
    public DateTimeOffset CreatedAt { get; private set; }
    
    private CompanyFollow() { }

    public static CompanyFollow Create(
        Guid userId,
        Guid companyId,
        DateTimeOffset now
    ) {
        if (userId == Guid.Empty) {
            throw new ArgumentException("User ID is required.", nameof(userId));
        }
        if (companyId == Guid.Empty) {
            throw new ArgumentException("Company ID is required.", nameof(companyId));
        }

        return new CompanyFollow {
            UserId = userId,
            CompanyId = companyId,
            CreatedAt = now
        };
    }
}