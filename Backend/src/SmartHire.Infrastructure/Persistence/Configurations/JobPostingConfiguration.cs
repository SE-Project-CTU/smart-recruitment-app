using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class JobPostingConfiguration : IEntityTypeConfiguration<JobPosting> {
    public void Configure(EntityTypeBuilder<JobPosting> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.JobLevel)
            .HasConversion<string>();
        
        builder.Property(x => x.WorkMode)
            .HasConversion<string>();
        
        builder.Property(x => x.JobType)
            .HasConversion<string>();
        
        builder.Property(x => x.Status)
            .HasConversion<string>();
        
        builder.HasOne(x => x.Company)
            .WithMany(x => x.JobPostings)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(x => x.CreatedByMembership)
            .WithMany(x => x.CreatedJobPostings)
            .HasForeignKey(x => new { x.CompanyId, x.CreatedBy })
            .HasPrincipalKey(x => new { x.CompanyId, x.UserId })
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(x => x.Province)
            .WithMany(x => x.JobPostings)
            .HasForeignKey(x => x.ProvinceId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(x => x.Ward)
            .WithMany(x => x.JobPostings)
            .HasForeignKey(x => x.WardId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}