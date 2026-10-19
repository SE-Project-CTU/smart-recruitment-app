using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification> {
    public void Configure(EntityTypeBuilder<Notification> builder) {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Type)
            .HasConversion<string>()
            .IsRequired();

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(x => x.Body)
            .IsRequired();

        builder.Property(x => x.Payload)
            .HasColumnType("jsonb");

        builder.Property(x => x.ResourceType)
            .HasMaxLength(100);

        builder.HasOne(x => x.Recipient)
            .WithMany()
            .HasForeignKey(x => x.RecipientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.RecipientId, x.ReadAt });
        builder.HasIndex(x => new { x.RecipientId, x.Type, x.CreatedAt });
        builder.HasIndex(x => x.ExpiresAt);
    }
}
