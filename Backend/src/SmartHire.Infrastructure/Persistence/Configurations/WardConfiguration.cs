using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class WardConfiguration : IEntityTypeConfiguration<Ward> {
    public void Configure(EntityTypeBuilder<Ward> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Name)
            .HasMaxLength(150);
        
        builder.Property(x => x.Status)
            .HasConversion<string>()
            .HasMaxLength(30);
        
        builder.HasOne(x => x.Province)
            .WithMany(x => x.Wards)
            .HasForeignKey(x => x.ProvinceId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(x => x.ProvinceId);
    }
}