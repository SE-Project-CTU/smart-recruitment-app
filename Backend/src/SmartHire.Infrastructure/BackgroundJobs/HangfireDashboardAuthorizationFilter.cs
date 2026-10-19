using Hangfire.Dashboard;
using SmartHire.Application.Common.Security;

namespace SmartHire.Infrastructure.BackgroundJobs;

public class HangfireDashboardAuthorizationFilter : IDashboardAuthorizationFilter {
    public bool Authorize(DashboardContext context) {
        var user = context.GetHttpContext().User;
        
        return user.Identity?.IsAuthenticated == true && user.IsInRole(RoleNames.Admin);
    }
}