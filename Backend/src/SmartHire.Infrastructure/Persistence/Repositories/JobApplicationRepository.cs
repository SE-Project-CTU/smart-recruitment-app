using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.Applications.Queries.ListMyApplications;
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
                application.CandidateId,
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
}
