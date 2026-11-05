using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class JobBookmarkConfiguration : IEntityTypeConfiguration<JobBookmark> {
    public void Configure(EntityTypeBuilder<JobBookmark> builder) {
        builder.HasKey(x => new { x.UserId, x.JobPostingId });
        
        builder.HasOne(x => x.User)
            .WithMany(x => x.JobBookmarks)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.JobPosting)
            .WithMany(x => x.Bookmarks)
            .HasForeignKey(x => x.JobPostingId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

