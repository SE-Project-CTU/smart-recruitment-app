using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class CompanyConfiguration : IEntityTypeConfiguration<Company> {
    public void Configure(EntityTypeBuilder<Company> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Name)
            .IsRequired().HasMaxLength(200);
        
        builder.Property(x => x.TaxCode)
            .IsRequired().HasMaxLength(20);
        
        builder.Property(x => x.VerificationStatus).HasConversion<string>();
        
        builder.Property(x => x.Email).HasMaxLength(320);
        builder.Property(x => x.Phone).HasMaxLength(30);
        builder.Property(x => x.Address).HasMaxLength(500);
        builder.Property(x => x.Website).HasMaxLength(500);
        builder.Property(x => x.Description).HasColumnType("text");
        builder.HasIndex(x => x.TaxCode).IsUnique();
        
        builder.HasOne(x => x.LogoFile)
            .WithOne(x => x.LogoCompany)
            .HasForeignKey<Company>(x => x.LogoFileId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}