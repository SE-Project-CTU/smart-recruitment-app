using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class JobRecommendationConfiguration : IEntityTypeConfiguration<JobRecommendation> {
    public void Configure(EntityTypeBuilder<JobRecommendation> builder) {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();

        builder.HasOne(x => x.Candidate)
            .WithMany(x => x.JobRecommendations)
            .HasForeignKey(x => x.CandidateId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Job)
            .WithMany(x => x.Recommendations)
            .HasForeignKey(x => x.JobId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.CandidateId, x.JobId })
            .IsUnique();
    }
}
