using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class CompanyMembershipConfiguration : IEntityTypeConfiguration<CompanyMembership> {
    public void Configure(EntityTypeBuilder<CompanyMembership> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Status).HasConversion<string>();
        builder.Property(x => x.Role).HasConversion<string>();
        
        builder.HasIndex(x => new { x.CompanyId, x.UserId })
            .IsUnique();
        
        builder.HasOne(x => x.Company)
            .WithMany(x => x.Memberships)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.User)
            .WithMany(x => x.CompanyMemberships)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}