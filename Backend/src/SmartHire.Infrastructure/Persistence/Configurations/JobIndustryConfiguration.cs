using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class JobIndustryConfiguration : IEntityTypeConfiguration<JobIndustry> {
    public void Configure(EntityTypeBuilder<JobIndustry> builder) {
        builder.HasKey(x => new { x.JobId, x.IndustryId });
        
        builder.HasOne(x => x.Job)
            .WithMany(x => x.JobIndustries)
            .HasForeignKey(x => x.JobId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Industry)
            .WithMany(x => x.JobIndustries)
            .HasForeignKey(x => x.IndustryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}