using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.Persistence;

namespace SmartHire.Infrastructure.BackgroundJobs;

public sealed class CleanupExpiredAiConversationsJob {
    private readonly IAiConversationRepository _conversationRepository;
    private readonly ILogger<CleanupExpiredAiConversationsJob> _logger;

    public CleanupExpiredAiConversationsJob(
        IAiConversationRepository conversationRepository,
        ILogger<CleanupExpiredAiConversationsJob> logger) {
        _conversationRepository = conversationRepository;
        _logger = logger;
    }

    public async Task ExecuteAsync(CancellationToken cancellationToken = default) {
        _logger.LogInformation("Starting scheduled cleanup of expired unpinned AI conversations (> 30 days)...");

        var cutoff = DateTimeOffset.UtcNow.AddDays(-30);
        var deletedCount = await _conversationRepository.DeleteExpiredUnpinnedAsync(cutoff, cancellationToken);

        _logger.LogInformation("Completed cleanup of expired AI conversations. Deleted {Count} records.", deletedCount);
    }
}
