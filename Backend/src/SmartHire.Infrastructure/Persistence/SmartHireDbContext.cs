using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence;

public sealed class SmartHireDbContext
    : DbContext {
    public SmartHireDbContext(
        DbContextOptions<SmartHireDbContext> options)
        : base(options) { }
    
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<CompanyMembership> CompanyMemberships => Set<CompanyMembership>();
    public DbSet<CompanyInvitation> CompanyInvitations => Set<CompanyInvitation>();
    public DbSet<CompanyJoinRequest> CompanyJoinRequests => Set<CompanyJoinRequest>();
    public DbSet<CompanyFollow> CompanyFollows => Set<CompanyFollow>();
    public DbSet<Province> Provinces => Set<Province>();
    public DbSet<Ward> Wards => Set<Ward>();
    public DbSet<IndustryGroup> IndustryGroups => Set<IndustryGroup>();
    public DbSet<Industry> Industries => Set<Industry>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<JobSkill> JobSkills => Set<JobSkill>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<JobIndustry> JobIndustries => Set<JobIndustry>();
    public DbSet<JobEmbedding> JobEmbeddings => Set<JobEmbedding>();
    public DbSet<CvTemplate> CvTemplates => Set<CvTemplate>();
    public DbSet<Cv> Cvs => Set<Cv>();
    public DbSet<CvVersion> CvVersions => Set<CvVersion>();
    public DbSet<CvEmbedding> CvEmbeddings => Set<CvEmbedding>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<ApplicationStatusHistory> ApplicationStatusHistories => Set<ApplicationStatusHistory>();
    public DbSet<AiMatchResult> AiMatchResults => Set<AiMatchResult>();
    public DbSet<JobRecommendation> JobRecommendations => Set<JobRecommendation>();
    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.HasPostgresExtension("vector");
        
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}
