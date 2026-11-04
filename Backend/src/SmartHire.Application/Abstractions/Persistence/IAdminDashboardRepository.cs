using SmartHire.Application.Features.Admin.Dashboard.DTOs;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IAdminDashboardRepository {
    Task<AdminDashboardOverviewDto> GetOverviewStatsAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken);
}

