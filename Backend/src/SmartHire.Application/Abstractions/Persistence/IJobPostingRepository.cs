using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IJobPostingRepository
{
    Task AddAsync(JobPosting jobPosting, CancellationToken cancellationToken);
}
