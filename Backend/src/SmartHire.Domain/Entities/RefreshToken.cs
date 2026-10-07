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
    
    public static RefreshToken Create(
        Guid userId,
        string tokenHash,
        DateTimeOffset expiresAt,
        DateTimeOffset now
    ) {
        if (userId == Guid.Empty) {
            throw new ArgumentException("User id is required", nameof(userId));
        }
        
        if (string.IsNullOrWhiteSpace(tokenHash)) {
            throw new ArgumentException("Token hash is required.", nameof(tokenHash));
        }
        
        if (expiresAt <= now) {
            throw new ArgumentException("Token expiration must be in the future.", nameof(expiresAt));
        }
        
        return new RefreshToken {
            UserId = userId,
            TokenHash = tokenHash,
            ExpiresAt = expiresAt,
            CreatedAt = now
        };
    }
}