using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class CvEmbeddingConfiguration : IEntityTypeConfiguration<CvEmbedding> {
    public void Configure(EntityTypeBuilder<CvEmbedding> builder) {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Embedding).HasColumnType("vector");
        builder.Property(x => x.Model).HasMaxLength(200);

        builder.HasOne(x => x.CvVersion)
            .WithOne(x => x.Embedding)
            .HasForeignKey<CvEmbedding>(x => x.CvVersionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.CvVersionId).IsUnique();
    }
}
