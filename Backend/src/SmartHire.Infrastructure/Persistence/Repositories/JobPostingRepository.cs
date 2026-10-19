using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class JobPostingRepository : IJobPostingRepository
{
    private readonly SmartHireDbContext _dbContext;

    public JobPostingRepository(SmartHireDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task AddAsync(JobPosting jobPosting, CancellationToken cancellationToken)
    {
        await _dbContext.JobPostings.AddAsync(jobPosting, cancellationToken);
    }
}
