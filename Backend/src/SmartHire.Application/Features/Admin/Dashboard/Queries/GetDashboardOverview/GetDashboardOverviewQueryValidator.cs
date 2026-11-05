using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Dashboard.Queries.GetDashboardOverview;

public static class GetDashboardOverviewQueryValidator {
    public static (DateTimeOffset From, DateTimeOffset To) ValidateAndNormalize(DateTimeOffset? from, DateTimeOffset? to) {
        var toNorm = to ?? DateTimeOffset.UtcNow;
        var fromNorm = from ?? toNorm.AddDays(-30);

        if (fromNorm > toNorm) {
            throw AdminExceptions.Validation("Invalid date range.", [
                new AppErrorDetail("to", ValidationReasons.NotAllowed, "The 'to' date must be greater than or equal to the 'from' date.")
            ]);
        }

        return (fromNorm, toNorm);
    }
}

