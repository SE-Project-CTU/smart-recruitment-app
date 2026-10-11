using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class User {
    public Guid Id { get; private set; }
    
    public string Email { get; private set; } = string.Empty;
    public string? Phone { get; private set; }
    public string PasswordHash { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    public Guid? AvatarFileId { get; private set; }
    public MediaFile? AvatarFile { get; private set; }
    public UserStatus Status { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    
    public ICollection<UserRole> UserRoles { get; private set; } = new List<UserRole>();
    
    public ICollection<RefreshToken> RefreshTokens { get; private set; }
        = new List<RefreshToken>();
    
    public ICollection<CompanyMembership> CompanyMemberships { get; private set; }
        = new List<CompanyMembership>();
    
    public ICollection<CompanyJoinRequest> SendCompanyRequests { get; private set; }
        = new List<CompanyJoinRequest>();
    
    public ICollection<CompanyInvitation> ReceiveCompanyInvitations { get; private set; }
        = new List<CompanyInvitation>();
    
    public ICollection<CompanyFollow> CompanyFollows { get; private set; }
        = new List<CompanyFollow>();
    
    public ICollection<Cv> Cvs { get; private set; }
        = new List<Cv>();
    
    public ICollection<JobApplication> Applications { get; private set; } = new List<JobApplication>();
    
    public ICollection<ApplicationStatusHistory> ChangedApplicationStatuses { get; private set; } =
        new List<ApplicationStatusHistory>();
    
    public ICollection<JobRecommendation> JobRecommendations { get; private set; } = new List<JobRecommendation>();
    public ICollection<MediaFile> MediaFiles { get; private set; } = new List<MediaFile>();
    
    private User() { }
    
    public static User Create(
        string email,
        string? phone,
        string passwordHash,
        string fullName,
        DateTimeOffset now
    ) {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email is required.", nameof(email));
        
        if (string.IsNullOrWhiteSpace(passwordHash))
            throw new ArgumentException("Password hash is required.", nameof(passwordHash));
        
        if (string.IsNullOrWhiteSpace(fullName))
            throw new ArgumentException("Full name is required.", nameof(fullName));
        
        return new User {
            Email = email.Trim().ToLowerInvariant(),
            Phone = string.IsNullOrWhiteSpace(phone) ? null : phone.Trim(),
            PasswordHash = passwordHash,
            FullName = fullName.Trim(),
            Status = UserStatus.Active,
            CreatedAt = now,
            UpdatedAt = now
        };
    }
    
    public void UpdateProfile(
        string fullName,
        string? phone,
        DateTimeOffset now
    ) {
        if (string.IsNullOrWhiteSpace(fullName)) {
            throw new ArgumentException("Full name is required.", nameof(fullName));
        }
        
        FullName = fullName.Trim();
        Phone = string.IsNullOrWhiteSpace(phone) ? null : phone.Trim();
        UpdatedAt = now;
    }

    public void ChangePasswordHash(
        string newPasswordHash,
        DateTimeOffset now
    ) {
        if (string.IsNullOrWhiteSpace(newPasswordHash)) {
            throw new ArgumentException("Password hash is required.", nameof(newPasswordHash));
        }
        
        PasswordHash = newPasswordHash;
        UpdatedAt = now;
    }
    
    public void AssignRole(Role role) {
        if (string.IsNullOrWhiteSpace(role.Name)) {
            throw new ArgumentException("Role name is required.", nameof(role));
        }
        
        if (UserRoles.Any(x => x.RoleId == role.Id)) {
            return;
        }
        
        UserRoles.Add(new UserRole(Id, role.Id));
    }
    
    public void SetAvatarFileId(
        Guid? avatarFileId,
        DateTimeOffset now
    ) {
        AvatarFileId = avatarFileId;
        UpdatedAt = now;
    }
}
