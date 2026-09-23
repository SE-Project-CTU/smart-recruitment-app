using Microsoft.EntityFrameworkCore;

namespace SmartHire.Infrastructure.Persistence;

public sealed class SmartHireDbContext
    : DbContext
{
    public SmartHireDbContext(
        DbContextOptions<SmartHireDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.HasPostgresExtension("vector");
    }
}