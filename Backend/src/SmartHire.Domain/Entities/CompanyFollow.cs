namespace SmartHire.Domain.Entities;

public class CompanyFollow {
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    
    public Guid CompanyId { get; private set; }
    public Company Company { get; private set; } = null!;
    
    public DateTimeOffset CreatedAt { get; private set; }
    
    private CompanyFollow() { }
}