namespace SmartHire.Domain.Entities;

public class RefreshToken {
    public Guid Id { get; private set; }
    
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;
    
    public string TokenHash { get; private set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? RevokedAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    
    private RefreshToken() { }
}