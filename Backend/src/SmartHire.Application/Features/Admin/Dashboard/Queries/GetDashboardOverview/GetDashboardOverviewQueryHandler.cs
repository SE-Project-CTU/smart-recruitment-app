using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Dashboard.DTOs;

namespace SmartHire.Application.Features.Admin.Dashboard.Queries.GetDashboardOverview;

public sealed class GetDashboardOverviewQueryHandler
    : IRequestHandler<GetDashboardOverviewQuery, AdminDashboardOverviewDto> {
    private readonly IAdminDashboardRepository _dashboardRepository;

    public GetDashboardOverviewQueryHandler(IAdminDashboardRepository dashboardRepository) {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<AdminDashboardOverviewDto> Handle(
        GetDashboardOverviewQuery request,
        CancellationToken cancellationToken) {
        var (from, to) = GetDashboardOverviewQueryValidator.ValidateAndNormalize(request.From, request.To);

        return await _dashboardRepository.GetOverviewStatsAsync(from, to, cancellationToken);
    }
}

