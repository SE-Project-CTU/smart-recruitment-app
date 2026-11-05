namespace SmartHire.Application.Features.Admin.Dashboard.DTOs;

public sealed record DashboardPeriodDto(
    DateTimeOffset From,
    DateTimeOffset To
);

public sealed record DashboardUsersDto(
    int Total,
    int New,
    int Active,
    int Locked
);

public sealed record DashboardCompaniesDto(
    int Total,
    int PendingVerification,
    int Verified,
    int Rejected
);

public sealed record DashboardJobPostingsDto(
    int Total,
    int PendingReview,
    int Open,
    int Expired,
    int Closed
);

public sealed record DashboardApplicationsDto(
    int Total,
    int New,
    int Interviews,
    int Rejected
);

public sealed record AdminDashboardOverviewDto(
    DashboardPeriodDto Period,
    DashboardUsersDto Users,
    DashboardCompaniesDto Companies,
    DashboardJobPostingsDto JobPostings,
    DashboardApplicationsDto Applications
);

