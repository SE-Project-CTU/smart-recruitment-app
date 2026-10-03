using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Configurations;

public class CompanyInvitationConfiguration : IEntityTypeConfiguration<CompanyInvitation> {
    public void Configure(EntityTypeBuilder<CompanyInvitation> builder) {
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Id)
            .HasDefaultValueSql("gen_random_uuid()")
            .ValueGeneratedOnAdd();
        
        builder.Property(x => x.Status)
            .HasConversion<string>();
        
        builder.HasOne(x => x.Company)
            .WithMany(x => x.Invitations)
            .HasForeignKey(x => x.CompanyId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Inviter)
            .WithMany(x => x.SendCompanyInvitations)
            .HasForeignKey(x => new {x.CompanyId, x.InviterId})
            .HasPrincipalKey(x => new {x.CompanyId, x.UserId})
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Invitee)
            .WithMany(x => x.ReceiveCompanyInvitations)
            .HasForeignKey(x => x.InviteeId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasIndex(x => x.InviteeId);
    }
}