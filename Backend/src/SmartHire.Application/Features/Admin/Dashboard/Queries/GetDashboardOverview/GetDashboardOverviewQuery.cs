using MediatR;
using SmartHire.Application.Features.Admin.Dashboard.DTOs;

namespace SmartHire.Application.Features.Admin.Dashboard.Queries.GetDashboardOverview;

public sealed record GetDashboardOverviewQuery(
    DateTimeOffset? From = null,
    DateTimeOffset? To = null
) : IRequest<AdminDashboardOverviewDto>;

