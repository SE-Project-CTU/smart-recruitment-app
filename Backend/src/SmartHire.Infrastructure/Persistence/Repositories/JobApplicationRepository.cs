using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

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
}
