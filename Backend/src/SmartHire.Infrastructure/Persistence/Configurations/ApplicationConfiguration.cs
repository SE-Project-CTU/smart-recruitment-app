using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<Application> {
    public void Configure(EntityTypeBuilder<Application> builder) {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()").ValueGeneratedOnAdd();
        builder.Property(x => x.UploadedCvUrl).HasMaxLength(1000);
        builder.Property(x => x.CoverLetter);
        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(32);

        builder.HasOne(x => x.Job)
            .WithMany(x => x.Applications)
            .HasForeignKey(x => x.JobId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(x => x.Candidate)
            .WithMany(x => x.Applications)
            .HasForeignKey(x => x.CandidateId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(x => x.CvVersion)
            .WithMany(x => x.Applications)
            .HasForeignKey(x => x.CvVersionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
