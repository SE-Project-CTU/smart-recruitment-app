using SmartHire.Infrastructure.Persistence.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class CvVersionConfiguration : IEntityTypeConfiguration<CvVersion> {
    public void Configure(EntityTypeBuilder<CvVersion> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Content)
            .HasJsonbDocumentConversion();
        
        builder.Property(x => x.Layout)
            .HasJsonbDocumentConversion();
        
        builder.Property(x => x.Presentation)
            .HasJsonbDocumentConversion();
        
        builder.Property(x => x.Language)
            .HasCvLanguageCodeConversion();
        
        builder.HasOne(x => x.Cv)
            .WithMany(x => x.Versions)
            .HasForeignKey(x => x.CvId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Template)
            .WithMany(x => x.CvVersions)
            .HasForeignKey(x => x.TemplateId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(x => new { x.CvId, x.VersionNumber })
            .IsUnique();
        
        builder.HasIndex(x => x.TemplateId);
    }
}