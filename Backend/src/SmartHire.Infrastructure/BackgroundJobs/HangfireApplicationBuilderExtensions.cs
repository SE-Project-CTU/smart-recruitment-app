using Hangfire;
using Hangfire.Dashboard;
using Microsoft.AspNetCore.Builder;

namespace SmartHire.Infrastructure.BackgroundJobs;

public static class HangfireApplicationBuilderExtensions {
    public static IApplicationBuilder UseBackgroundJobDashboard(
        this IApplicationBuilder app,
        string path = "/hangfire") {
        return app.UseHangfireDashboard(path, new DashboardOptions {
            // Preserves the existing local-development behavior. Add an authorization
            // filter before exposing the dashboard outside a trusted development setup.
            Authorization = Array.Empty<IDashboardAuthorizationFilter>()
            // Authorization = [
            //     new HangfireDashboardAuthorizationFilter()
            // ]
        });
    }
}