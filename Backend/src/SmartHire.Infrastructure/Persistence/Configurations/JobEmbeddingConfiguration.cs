using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Pgvector.EntityFrameworkCore;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class JobEmbeddingConfiguration : IEntityTypeConfiguration<JobEmbedding> {
    public void Configure(EntityTypeBuilder<JobEmbedding> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Embedding)
            .HasColumnType("vector(768)")
            .IsRequired();
        
        builder.Property(x => x.Model)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();
        
        builder.HasOne(x => x.Job)
            .WithOne(x => x.Embedding)
            .HasForeignKey<JobEmbedding>(x => x.JobId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(x => x.JobId)
            .IsUnique();

        builder.HasIndex(x => x.Embedding)
            .HasMethod("hnsw")
            .HasOperators("vector_cosine_ops");
    }
}
