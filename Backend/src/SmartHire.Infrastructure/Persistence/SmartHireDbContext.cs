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
    
    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.HasPostgresExtension("vector");
        
        modelBuilder.Entity<JobPosting>(entity => {
            entity.HasKey(x => x.Id);
            
            entity.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()")
                .ValueGeneratedOnAdd();
        });
        
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}