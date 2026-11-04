using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using SmartHire.Infrastructure.Seeding;

namespace SmartHire.Infrastructure.Persistence;

public static class DatabaseInitializationExtensions {
    /// <summary>
    /// Áp dụng các migration còn pending, khởi tạo tài khoản quản trị và backfill dữ liệu nếu cần.
    /// </summary>
    public static async Task<IApplicationBuilder> ApplyDatabaseMigrationsAndSeedAsync(this IApplicationBuilder app) {
        using var scope = app.ApplicationServices.CreateScope();

        var db = scope.ServiceProvider.GetRequiredService<SmartHireDbContext>();
        await db.Database.MigrateAsync();

        var adminAccountSeeder = scope.ServiceProvider.GetRequiredService<AdminAccountSeeder>();
        await adminAccountSeeder.SeedAsync();

        var cvBackfiller = scope.ServiceProvider.GetRequiredService<CvDocumentFontSizeBackfiller>();
        await cvBackfiller.BackfillAsync();

        return app;
    }
}

