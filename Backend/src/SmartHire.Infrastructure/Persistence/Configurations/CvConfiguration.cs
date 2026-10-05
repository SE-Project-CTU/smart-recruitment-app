using SmartHire.Infrastructure.Persistence.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class CvConfiguration : IEntityTypeConfiguration<Cv> {
    public void Configure(EntityTypeBuilder<Cv> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Title)
            .HasMaxLength(200);
        
        builder.Property(x => x.Content)
            .HasJsonbDocumentConversion();
        
        builder.Property(x => x.Layout)
            .HasJsonbDocumentConversion();
        
        builder.Property(x => x.Presentation)
            .HasJsonbDocumentConversion();
        
        builder.Property(x => x.Language)
            .HasCvLanguageCodeConversion();
        
        builder.HasOne(x => x.Candidate)
            .WithMany(x => x.Cvs)
            .HasForeignKey(x => x.CandidateId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Template)
            .WithMany(x => x.Cvs)
            .HasForeignKey(x => x.TemplateId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(x => x.CandidateId);
    }
}