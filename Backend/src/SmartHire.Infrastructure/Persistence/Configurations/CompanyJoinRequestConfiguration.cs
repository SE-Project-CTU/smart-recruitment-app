using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class CompanyJoinRequestConfiguration : IEntityTypeConfiguration<CompanyJoinRequest> {
    public void Configure(EntityTypeBuilder<CompanyJoinRequest> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Status)
            .HasConversion<string>();
        
        builder.HasOne(x => x.Company)
            .WithMany(x => x.JoinRequests)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.User)
            .WithMany(x => x.SendCompanyRequests)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(x => x.Reviewer)
            .WithMany(x => x.ReviewedCompanyJoinRequests)
            .HasForeignKey(x => new { x.CompanyId, x.ReviewedBy })
            .HasPrincipalKey(x => new {x.CompanyId, x.UserId})
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(x => x.UserId);
    }
}