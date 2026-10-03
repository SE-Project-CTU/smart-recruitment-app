using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class CompanyFollowConfiguration : IEntityTypeConfiguration<CompanyFollow> {
    public void Configure(EntityTypeBuilder<CompanyFollow> builder) {
        builder.HasKey(x => new { x.UserId, x.CompanyId });
        
        builder.HasOne(x => x.User)
            .WithMany(x => x.CompanyFollows)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Company)
            .WithMany(x => x.Followers)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}