using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Media.Jobs.DeleteMediaFile;

namespace SmartHire.Application.Features.Cv.Jobs.CleanupOrphanedArchivedCvVersions;

public sealed class CleanupOrphanedArchivedCvVersionsJob : IBackgroundJob<CleanupOrphanedArchivedCvVersionsJobArgs>
{
    private readonly ICvVersionRepository _cvVersionRepository;
    private readonly IBackgroundJobScheduler _jobScheduler;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CleanupOrphanedArchivedCvVersionsJob> _logger;

    public CleanupOrphanedArchivedCvVersionsJob(
        ICvVersionRepository cvVersionRepository,
        IBackgroundJobScheduler jobScheduler,
        IUnitOfWork unitOfWork,
        ILogger<CleanupOrphanedArchivedCvVersionsJob> logger)
    {
        _cvVersionRepository = cvVersionRepository;
        _jobScheduler = jobScheduler;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task ExecuteAsync(
        CleanupOrphanedArchivedCvVersionsJobArgs args,
        CancellationToken cancellationToken)
    {
        var threshold = DateTimeOffset.UtcNow.AddDays(-Math.Max(0, args.RetentionDays));
        int totalCleaned = 0;

        while (!cancellationToken.IsCancellationRequested)
        {
            var orphanedVersions = await _cvVersionRepository.GetOrphanedArchivedVersionsAsync(
                threshold,
                100,
                cancellationToken);

            if (orphanedVersions.Count == 0)
            {
                break;
            }

            foreach (var version in orphanedVersions)
            {
                // Nếu version có ảnh preview độc lập, đẩy job xóa file trên Cloudinary
                if (version.PreviewFileId.HasValue)
                {
                    _jobScheduler.Enqueue<DeleteMediaFileJob, DeleteMediaFileJobArgs>(
                        new DeleteMediaFileJobArgs(version.PreviewFileId.Value)
                    );
                }

                // Xóa bản ghi version
                _cvVersionRepository.Delete(version);
                totalCleaned++;
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        if (totalCleaned > 0)
        {
            _logger.LogInformation(
                "Successfully cleaned up {Count} orphaned CV versions from archived CVs at {Now}.",
                totalCleaned,
                DateTimeOffset.UtcNow);
        }
        else
        {
            _logger.LogInformation("No orphaned CV versions found to clean up at {Now}.", DateTimeOffset.UtcNow);
        }
    }
}
