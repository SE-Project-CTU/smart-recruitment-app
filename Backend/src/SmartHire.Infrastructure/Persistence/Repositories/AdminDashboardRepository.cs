using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Dashboard.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class AdminDashboardRepository : IAdminDashboardRepository {
    private readonly SmartHireDbContext _dbContext;

    public AdminDashboardRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    public async Task<AdminDashboardOverviewDto> GetOverviewStatsAsync(
        DateTimeOffset from,
        DateTimeOffset to,
        CancellationToken cancellationToken) {
        var now = DateTimeOffset.UtcNow;

        // 1. Users aggregate
        var userStats = await _dbContext.Users.AsNoTracking()
            .GroupBy(_ => 1)
            .Select(g => new DashboardUsersDto(
                g.Count(),
                g.Count(u => u.CreatedAt >= from && u.CreatedAt <= to),
                g.Count(u => u.Status == UserStatus.Active),
                g.Count(u => u.Status == UserStatus.Locked)
            ))
            .FirstOrDefaultAsync(cancellationToken) ?? new DashboardUsersDto(0, 0, 0, 0);

        // 2. Companies aggregate
        var companyStats = await _dbContext.Companies.AsNoTracking()
            .GroupBy(_ => 1)
            .Select(g => new DashboardCompaniesDto(
                g.Count(),
                g.Count(c => c.VerificationStatus == CompanyVerificationStatus.Pending),
                g.Count(c => c.VerificationStatus == CompanyVerificationStatus.Verified),
                g.Count(c => c.VerificationStatus == CompanyVerificationStatus.Rejected)
            ))
            .FirstOrDefaultAsync(cancellationToken) ?? new DashboardCompaniesDto(0, 0, 0, 0);

        // 3. Job Postings aggregate
        var jobStats = await _dbContext.JobPostings.AsNoTracking()
            .GroupBy(_ => 1)
            .Select(g => new DashboardJobPostingsDto(
                g.Count(),
                g.Count(j => j.Status == JobPostingStatus.PendingReview),
                g.Count(j => j.Status == JobPostingStatus.Published && (j.Deadline == null || j.Deadline >= now)),
                g.Count(j => j.Status == JobPostingStatus.Expired || (j.Status == JobPostingStatus.Published && j.Deadline != null && j.Deadline < now)),
                g.Count(j => j.Status == JobPostingStatus.Closed)
            ))
            .FirstOrDefaultAsync(cancellationToken) ?? new DashboardJobPostingsDto(0, 0, 0, 0, 0);

        // 4. Applications aggregate
        var appStats = await _dbContext.Applications.AsNoTracking()
            .GroupBy(_ => 1)
            .Select(g => new DashboardApplicationsDto(
                g.Count(),
                g.Count(a => a.AppliedAt >= from && a.AppliedAt <= to),
                g.Count(a => a.Status == ApplicationStatus.Interviewing),
                g.Count(a => a.Status == ApplicationStatus.Rejected)
            ))
            .FirstOrDefaultAsync(cancellationToken) ?? new DashboardApplicationsDto(0, 0, 0, 0);

        return new AdminDashboardOverviewDto(
            new DashboardPeriodDto(from, to),
            userStats,
            companyStats,
            jobStats,
            appStats
        );
    }
}
