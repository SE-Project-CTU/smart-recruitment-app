using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class ProvinceConfiguration : IEntityTypeConfiguration<Province> {
    public void Configure(EntityTypeBuilder<Province> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Name)
            .HasMaxLength(150);
        
        builder.HasIndex(x => x.Name).IsUnique();
        
        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(30);
    }
}