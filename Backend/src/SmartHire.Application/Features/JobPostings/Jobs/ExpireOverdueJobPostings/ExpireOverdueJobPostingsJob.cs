using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;

namespace SmartHire.Application.Features.JobPostings.Jobs.ExpireOverdueJobPostings;

public sealed class ExpireOverdueJobPostingsJob : IBackgroundJob<ExpireOverdueJobPostingsJobArgs>
{
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ExpireOverdueJobPostingsJob> _logger;

    public ExpireOverdueJobPostingsJob(
        IJobPostingRepository jobPostingRepository,
        IUnitOfWork unitOfWork,
        ILogger<ExpireOverdueJobPostingsJob> logger)
    {
        _jobPostingRepository = jobPostingRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task ExecuteAsync(
        ExpireOverdueJobPostingsJobArgs args,
        CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;
        var overduePostings = await _jobPostingRepository.GetPublishedOverduePostingsAsync(now, cancellationToken);

        if (overduePostings.Count == 0)
        {
            _logger.LogInformation("No overdue published job postings found at {Now}", now);
            return;
        }

        foreach (var posting in overduePostings)
        {
            posting.Expire(now);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Successfully expired {Count} overdue job postings at {Now}", overduePostings.Count, now);
    }
}
