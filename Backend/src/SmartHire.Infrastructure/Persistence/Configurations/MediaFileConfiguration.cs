using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class MediaFileConfiguration : IEntityTypeConfiguration<MediaFile> {
    public void Configure(EntityTypeBuilder<MediaFile> builder) {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.FileName).HasMaxLength(255);
        builder.Property(x => x.FileUrl).HasMaxLength(2000);
        builder.Property(x => x.FileType).HasMaxLength(100);
        
        builder.HasOne(x => x.Owner)
            .WithMany(x => x.MediaFiles)
            .HasForeignKey(x => x.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}