using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;

namespace SmartHire.Application.Features.Ai.Jobs.CleanupExpiredAiConversations;

public sealed class CleanupExpiredAiConversationsJob : IBackgroundJob<CleanupExpiredAiConversationsJobArgs> {
    private readonly IAiConversationRepository _conversationRepository;
    private readonly ILogger<CleanupExpiredAiConversationsJob> _logger;

    public CleanupExpiredAiConversationsJob(
        IAiConversationRepository conversationRepository,
        ILogger<CleanupExpiredAiConversationsJob> logger) {
        _conversationRepository = conversationRepository;
        _logger = logger;
    }

    public async Task ExecuteAsync(
        CleanupExpiredAiConversationsJobArgs args,
        CancellationToken cancellationToken) {
        var cutoff = DateTimeOffset.UtcNow.AddDays(-30);
        _logger.LogInformation("Executing cleanup of unpinned AI conversations older than {Cutoff}", cutoff);

        var deletedCount = await _conversationRepository.DeleteExpiredUnpinnedAsync(cutoff, cancellationToken);
        _logger.LogInformation("Deleted {DeletedCount} expired unpinned AI conversations", deletedCount);
    }
}
