using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class AiMatchResultConfiguration : IEntityTypeConfiguration<AiMatchResult> {
    public void Configure(EntityTypeBuilder<AiMatchResult> builder) {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();

        builder.HasOne(x => x.Application)
            .WithOne(x => x.AiMatchResult)
            .HasForeignKey<AiMatchResult>(x => x.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.CvVersion)
            .WithMany(x => x.AiMatchResults)
            .HasForeignKey(x => x.CvVersionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
