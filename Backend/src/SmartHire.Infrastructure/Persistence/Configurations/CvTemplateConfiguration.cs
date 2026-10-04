using SmartHire.Infrastructure.Persistence.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class CvTemplateConfiguration : IEntityTypeConfiguration<CvTemplate> {
    public void Configure(EntityTypeBuilder<CvTemplate> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Code)
            .HasMaxLength(100);
        
        builder.HasIndex(x => x.Code)
            .IsUnique();
        
        builder.Property(x => x.Name)
            .HasMaxLength(200);
        
        builder.Property(x => x.Description)
            .HasColumnType("text");
        
        builder.Property(x => x.ThumbnailUrl)
            .HasMaxLength(1000);
        
        builder.Property(x => x.Version)
            .HasMaxLength(50);
        
        builder.Property(x => x.DefaultLayout)
            .HasJsonbDocumentConversion();
        
        builder.Property(x => x.DefaultContent)
            .HasJsonbDocumentConversion();
        
        builder.Property(x => x.DefaultPresentation)
            .HasJsonbDocumentConversion();
        
        builder.Property(x => x.Language)
            .HasCvLanguageCodeConversion();
    }
}