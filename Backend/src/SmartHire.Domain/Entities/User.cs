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

    public ICollection<Application> Applications { get; private set; } = new List<Application>();
    public ICollection<ApplicationStatusHistory> ChangedApplicationStatuses { get; private set; } = new List<ApplicationStatusHistory>();
    public ICollection<JobRecommendation> JobRecommendations { get; private set; } = new List<JobRecommendation>();
    public ICollection<MediaFile> MediaFiles { get; private set; } = new List<MediaFile>();
    
    private User() { }
}
