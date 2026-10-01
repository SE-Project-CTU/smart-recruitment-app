using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class User {
    public Guid Id { get; private set; }
    
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string PasswordHash { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; }
    public UserStatus Status { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    
    public ICollection<UserRole> UserRoles { get; private set; } = new List<UserRole>();
    
    public ICollection<RefreshToken> RefreshTokens { get; private set; }
        = new List<RefreshToken>();
    
    private User() { }
}