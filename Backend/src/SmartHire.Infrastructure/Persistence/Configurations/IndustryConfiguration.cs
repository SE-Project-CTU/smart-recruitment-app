using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class IndustryConfiguration : IEntityTypeConfiguration<Industry> {
    public void Configure(EntityTypeBuilder<Industry> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Name)
            .HasMaxLength(150);
        
        builder.HasIndex(x => x.Name)
            .IsUnique();
        
        builder.HasOne(x => x.Group)
            .WithMany(x => x.Industries)
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(x => x.GroupId);
    }
}