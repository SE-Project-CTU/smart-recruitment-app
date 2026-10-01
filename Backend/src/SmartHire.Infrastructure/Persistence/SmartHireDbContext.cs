using System.Reflection;
using Microsoft.EntityFrameworkCore;
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