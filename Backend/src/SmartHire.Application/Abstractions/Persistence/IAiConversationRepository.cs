using SmartHire.Domain.Entities;

namespace SmartHire.Application.Abstractions.Persistence;

public interface IAiConversationRepository {
    Task<AiConversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<AiConversation?> GetByIdWithMessagesAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AiConversation>> GetByCandidateIdAsync(Guid candidateId, string? search = null, CancellationToken cancellationToken = default);
    Task<int> CountByCandidateIdAsync(Guid candidateId, CancellationToken cancellationToken = default);
    Task<AiConversation?> GetOldestUnpinnedAsync(Guid candidateId, CancellationToken cancellationToken = default);
    Task AddAsync(AiConversation conversation, CancellationToken cancellationToken = default);
    Task AddMessageAsync(AiMessage message, CancellationToken cancellationToken = default);
    void Update(AiConversation conversation);
    void Delete(AiConversation conversation);
    Task<int> DeleteExpiredUnpinnedAsync(DateTimeOffset cutoff, CancellationToken cancellationToken = default);
    Task<int> DeleteAllByCandidateIdAsync(Guid candidateId, CancellationToken cancellationToken = default);
}
