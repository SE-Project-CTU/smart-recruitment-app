using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class IndustryGroupConfiguration : IEntityTypeConfiguration<IndustryGroup> {
    public void Configure(EntityTypeBuilder<IndustryGroup> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Name)
            .HasMaxLength(150);
        
        builder.Property(x => x.IsActive);
    }
}