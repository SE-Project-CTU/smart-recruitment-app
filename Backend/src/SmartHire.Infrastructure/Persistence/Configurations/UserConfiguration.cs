using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User> {
    public void Configure(EntityTypeBuilder<User> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Email)
            .IsRequired().HasMaxLength(256);
        
        builder.HasIndex(x => x.Email)
            .IsUnique();
        
        builder.Property(x => x.PasswordHash)
            .IsRequired();
        
        builder.Property(x => x.FullName)
            .IsRequired().HasMaxLength(100);
        
        builder.Property(x => x.Status)
            .HasConversion<string>();
    }
}