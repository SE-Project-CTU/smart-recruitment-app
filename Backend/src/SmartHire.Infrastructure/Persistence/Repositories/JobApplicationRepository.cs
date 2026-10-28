using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.Applications.Queries.ListMyApplications;
using SmartHire.Application.Features.Applications.Queries.ListApplicationsForJob;
using SmartHire.Application.Features.Companies.Queries.ListCompanyApplications;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class JobApplicationRepository(SmartHireDbContext dbContext) : IJobApplicationRepository {
    public Task<bool> ExistsForCandidateAsync(
        Guid jobId,
        Guid candidateId,
        CancellationToken cancellationToken) =>
        dbContext.Applications.AsNoTracking()
            .AnyAsync(application => application.JobId == jobId && application.CandidateId == candidateId,
                cancellationToken);

    public Task<Guid?> GetApplicationIdForCandidateAsync(
        Guid jobId,
        Guid candidateId,
        CancellationToken cancellationToken) =>
        dbContext.Applications.AsNoTracking()
            .Where(application => application.JobId == jobId && application.CandidateId == candidateId)
            .Select(application => (Guid?)application.Id)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<bool> IsUploadedCvFileInUseAsync(Guid fileId, CancellationToken cancellationToken) =>
        dbContext.Applications.AsNoTracking()
            .AnyAsync(application => application.UploadedCvFileId == fileId, cancellationToken);

    public async Task AddAsync(JobApplication application, CancellationToken cancellationToken) =>
        await dbContext.Applications.AddAsync(application, cancellationToken);

    public Task<int> CountMineAsync(
        Guid candidateId,
        ApplicationStatus? status,
        CancellationToken cancellationToken) =>
        ApplyMineFilters(candidateId, status).CountAsync(cancellationToken);

    public Task<List<MyApplicationListItemData>> GetMinePageAsync(
        Guid candidateId,
        ApplicationStatus? status,
        MyApplicationsSort sort,
        SortDirection direction,
        int skip,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = ApplyMineFilters(candidateId, status);
        IOrderedQueryable<JobApplication> ordered = (sort, direction) switch {
            (MyApplicationsSort.AppliedAt, SortDirection.Asc) =>
                query.OrderBy(application => application.AppliedAt).ThenBy(application => application.Id),
            (MyApplicationsSort.AppliedAt, SortDirection.Desc) =>
                query.OrderByDescending(application => application.AppliedAt).ThenBy(application => application.Id),
            (MyApplicationsSort.UpdatedAt, SortDirection.Asc) =>
                query.OrderBy(application => application.UpdatedAt).ThenBy(application => application.Id),
            (MyApplicationsSort.UpdatedAt, SortDirection.Desc) =>
                query.OrderByDescending(application => application.UpdatedAt).ThenBy(application => application.Id),
            _ => throw new ArgumentOutOfRangeException(nameof(sort), sort, "Unsupported application ordering.")
        };

        return ordered
            .Skip(skip)
            .Take(pageSize)
            .Select(application => new MyApplicationListItemData(
                application.Id,
                application.JobId,
                new ApplicationJobSummaryData(
                    application.Job.Id,
                    application.Job.Title,
                    new ApplicationCompanySummaryData(
                        application.Job.Company.Id,
                        application.Job.Company.Name,
                        application.Job.Company.LogoFile != null ? application.Job.Company.LogoFile.FileUrl : null),
                    new ApplicationLocationSummaryData(
                        application.Job.Province.Id,
                        application.Job.Province.Name),
                    application.Job.Ward != null
                        ? new ApplicationLocationSummaryData(
                            application.Job.Ward.Id,
                            application.Job.Ward.Name)
                        : null,
                    application.Job.ExperienceYears,
                    application.Job.JobLevel,
                    application.Job.WorkMode,
                    application.Job.JobType,
                    application.Job.SalaryMin,
                    application.Job.SalaryMax,
                    application.Job.SalaryNegotiable,
                    application.Job.Deadline,
                    application.Job.Status),
                application.CvVersionId,
                application.UploadedCvFile == null ? null : application.UploadedCvFile.FileUrl,
                application.CoverLetter,
                application.Status,
                application.AppliedAt,
                application.UpdatedAt))
            .ToListAsync(cancellationToken);
    }

    private IQueryable<JobApplication> ApplyMineFilters(Guid candidateId, ApplicationStatus? status) {
        var query = dbContext.Applications
            .AsNoTracking()
            .Where(application => application.CandidateId == candidateId);
        if (status.HasValue) query = query.Where(application => application.Status == status.Value);
        return query;
    }

    public Task<int> CountByJobIdAsync(
        Guid jobId,
        ApplicationStatus? status,
        CancellationToken cancellationToken) =>
        ApplyJobFilters(jobId, status).CountAsync(cancellationToken);

    public Task<ApplicationDetailData?> GetDetailByIdAsync(
        Guid applicationId,
        CancellationToken cancellationToken) =>
        dbContext.Applications
            .AsNoTracking()
            .Where(application => application.Id == applicationId)
            .Select(application => new ApplicationDetailData(
                application.Id,
                application.JobId,
                new ApplicationJobSummaryData(
                    application.Job.Id,
                    application.Job.Title,
                    new ApplicationCompanySummaryData(
                        application.Job.Company.Id,
                        application.Job.Company.Name,
                        application.Job.Company.LogoFile != null ? application.Job.Company.LogoFile.FileUrl : null),
                    new ApplicationLocationSummaryData(
                        application.Job.Province.Id,
                        application.Job.Province.Name),
                    application.Job.Ward != null
                        ? new ApplicationLocationSummaryData(
                            application.Job.Ward.Id,
                            application.Job.Ward.Name)
                        : null,
                    application.Job.ExperienceYears,
                    application.Job.JobLevel,
                    application.Job.WorkMode,
                    application.Job.JobType,
                    application.Job.SalaryMin,
                    application.Job.SalaryMax,
                    application.Job.SalaryNegotiable,
                    application.Job.Deadline,
                    application.Job.Status),
                new ApplicationCandidateData(
                    application.Candidate.Id,
                    application.Candidate.FullName,
                    application.Candidate.Email,
                    application.Candidate.Phone,
                    application.Candidate.AvatarFile != null ? application.Candidate.AvatarFile.FileUrl : null),
                application.Job.CompanyId,
                application.CvVersionId,
                application.CvVersion,
                application.UploadedCvFile == null ? null : application.UploadedCvFile.FileUrl,
                application.CoverLetter,
                application.Status,
                application.AppliedAt,
                application.UpdatedAt))
            .SingleOrDefaultAsync(cancellationToken);

    public Task<int> CountStatusHistoryAsync(
        Guid applicationId,
        CancellationToken cancellationToken) =>
        dbContext.ApplicationStatusHistories
            .CountAsync(history => history.ApplicationId == applicationId, cancellationToken);

    public Task<List<ApplicationStatusHistoryData>> GetStatusHistoryPageAsync(
        Guid applicationId,
        int skip,
        int pageSize,
        CancellationToken cancellationToken) =>
        dbContext.ApplicationStatusHistories
            .AsNoTracking()
            .Where(history => history.ApplicationId == applicationId)
            .OrderBy(history => history.CreatedAt)
            .ThenBy(history => history.Id)
            .Skip(skip)
            .Take(pageSize)
            .Select(history => new ApplicationStatusHistoryData(
                history.Id,
                history.ApplicationId,
                history.Status,
                new ApplicationStatusHistoryActorData(
                    history.ChangedByUser.Id,
                    history.ChangedByUser.FullName,
                    history.ChangedByUser.Email,
                    history.ChangedByUser.AvatarFile != null ? history.ChangedByUser.AvatarFile.FileUrl : null,
                    history.ChangedBy == history.Application.CandidateId
                        ? RoleNames.Candidate
                        : history.ChangedByUser.UserRoles
                            .Select(ur => ur.Role.Name)
                            .OrderBy(name => name)
                            .FirstOrDefault()),
                history.Note,
                history.CreatedAt))
            .ToListAsync(cancellationToken);

    public Task<JobApplication?> GetForStatusUpdateByIdAsync(
        Guid applicationId,
        CancellationToken cancellationToken) =>
        dbContext.Applications
            .Include(application => application.Job)
                .ThenInclude(job => job.Company)
            .Include(application => application.UploadedCvFile)
            .SingleOrDefaultAsync(application => application.Id == applicationId, cancellationToken);

    public Task<List<JobApplicationListItemData>> GetPageByJobIdAsync(
        Guid jobId,
        ApplicationStatus? status,
        JobApplicationsSort sort,
        SortDirection direction,
        int skip,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = ApplyJobFilters(jobId, status);
        IOrderedQueryable<JobApplication> ordered = (sort, direction) switch {
            (JobApplicationsSort.CreatedAt, SortDirection.Asc) =>
                query.OrderBy(application => application.AppliedAt).ThenBy(application => application.Id),
            (JobApplicationsSort.CreatedAt, SortDirection.Desc) =>
                query.OrderByDescending(application => application.AppliedAt).ThenBy(application => application.Id),
            _ => throw new ArgumentOutOfRangeException(nameof(sort), sort, "Unsupported job application ordering.")
        };

        return ordered
            .Skip(skip)
            .Take(pageSize)
            .Select(application => new JobApplicationListItemData(
                application.Id,
                application.JobId,
                new ApplicationCandidateData(
                    application.Candidate.Id,
                    application.Candidate.FullName,
                    application.Candidate.Email,
                    application.Candidate.Phone,
                    application.Candidate.AvatarFile != null ? application.Candidate.AvatarFile.FileUrl : null),
                application.CvVersionId,
                application.UploadedCvFile == null ? null : application.UploadedCvFile.FileUrl,
                application.CoverLetter,
                application.Status,
                application.AppliedAt,
                application.UpdatedAt))
            .ToListAsync(cancellationToken);
    }

    private IQueryable<JobApplication> ApplyJobFilters(Guid jobId, ApplicationStatus? status) {
        var query = dbContext.Applications
            .AsNoTracking()
            .Where(application => application.JobId == jobId);
        if (status.HasValue) query = query.Where(application => application.Status == status.Value);
        return query;
    }

    public Task<int> CountByCompanyIdAsync(
        Guid companyId,
        Guid? jobId,
        ApplicationStatus? status,
        string? search,
        CancellationToken cancellationToken) =>
        ApplyCompanyFilters(companyId, jobId, status, search).CountAsync(cancellationToken);

    public Task<List<CompanyApplicationListItemData>> GetPageByCompanyIdAsync(
        Guid companyId,
        Guid? jobId,
        ApplicationStatus? status,
        string? search,
        CompanyApplicationsSort sort,
        SortDirection direction,
        int skip,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = ApplyCompanyFilters(companyId, jobId, status, search);
        IOrderedQueryable<JobApplication> ordered = (sort, direction) switch {
            (CompanyApplicationsSort.AppliedAt, SortDirection.Asc) =>
                query.OrderBy(application => application.AppliedAt).ThenBy(application => application.Id),
            (CompanyApplicationsSort.AppliedAt, SortDirection.Desc) =>
                query.OrderByDescending(application => application.AppliedAt).ThenBy(application => application.Id),
            (CompanyApplicationsSort.CandidateName, SortDirection.Asc) =>
                query.OrderBy(application => application.Candidate.FullName).ThenBy(application => application.Id),
            (CompanyApplicationsSort.CandidateName, SortDirection.Desc) =>
                query.OrderByDescending(application => application.Candidate.FullName).ThenBy(application => application.Id),
            (CompanyApplicationsSort.JobTitle, SortDirection.Asc) =>
                query.OrderBy(application => application.Job.Title).ThenBy(application => application.Id),
            (CompanyApplicationsSort.JobTitle, SortDirection.Desc) =>
                query.OrderByDescending(application => application.Job.Title).ThenBy(application => application.Id),
            (CompanyApplicationsSort.Status, SortDirection.Asc) =>
                query.OrderBy(application => application.Status).ThenBy(application => application.Id),
            (CompanyApplicationsSort.Status, SortDirection.Desc) =>
                query.OrderByDescending(application => application.Status).ThenBy(application => application.Id),
            _ => throw new ArgumentOutOfRangeException(nameof(sort), sort, "Unsupported company application ordering.")
        };

        return ordered
            .Skip(skip)
            .Take(pageSize)
            .Select(application => new CompanyApplicationListItemData(
                application.Id,
                application.JobId,
                application.Job.Title,
                application.Job.CompanyId,
                application.Job.Company.Name,
                application.Job.Company.LogoFile != null ? application.Job.Company.LogoFile.FileUrl : null,
                new ApplicationCandidateData(
                    application.Candidate.Id,
                    application.Candidate.FullName,
                    application.Candidate.Email,
                    application.Candidate.Phone,
                    application.Candidate.AvatarFile != null ? application.Candidate.AvatarFile.FileUrl : null),
                application.CvVersionId,
                application.UploadedCvFile == null ? null : application.UploadedCvFile.FileUrl,
                application.CoverLetter,
                application.Status,
                application.AppliedAt,
                application.UpdatedAt))
            .ToListAsync(cancellationToken);
    }

    public Task<bool> CanRecruiterAccessCvVersionAsync(
        Guid cvId,
        Guid versionId,
        Guid recruiterUserId,
        CancellationToken cancellationToken) =>
        dbContext.Applications.AsNoTracking()
            .AnyAsync(a => a.CvVersionId == versionId
                        && a.CvVersion != null && a.CvVersion.CvId == cvId
                        && a.Job.Company.Memberships.Any(m => m.UserId == recruiterUserId && m.Status == CompanyMembershipStatus.Active),
                      cancellationToken);

    private IQueryable<JobApplication> ApplyCompanyFilters(
        Guid companyId,
        Guid? jobId,
        ApplicationStatus? status,
        string? search) {
        var query = dbContext.Applications
            .AsNoTracking()
            .Where(application => application.Job.CompanyId == companyId);

        if (jobId.HasValue) {
            query = query.Where(application => application.JobId == jobId.Value);
        }

        if (status.HasValue) {
            query = query.Where(application => application.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search)) {
            var trimmed = search.Trim();
            var pattern = $"%{trimmed}%";
            query = query.Where(application =>
                EF.Functions.ILike(application.Candidate.FullName, pattern) ||
                EF.Functions.ILike(application.Candidate.Email, pattern) ||
                (application.Candidate.Phone != null && EF.Functions.ILike(application.Candidate.Phone, pattern)) ||
                EF.Functions.ILike(application.Job.Title, pattern));
        }

        return query;
    }
}
