using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class AiConversationRepository : IAiConversationRepository {
    private readonly SmartHireDbContext _dbContext;

    public AiConversationRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    public async Task<AiConversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) {
        return await _dbContext.AiConversations
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<AiConversation?> GetByIdWithMessagesAsync(Guid id, CancellationToken cancellationToken = default) {
        return await _dbContext.AiConversations
            .Include(c => c.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<AiConversation>> GetByCandidateIdAsync(Guid candidateId, string? search = null, CancellationToken cancellationToken = default) {
        var query = _dbContext.AiConversations
            .AsNoTracking()
            .Include(c => c.Messages)
            .Where(c => c.CandidateId == candidateId);

        if (!string.IsNullOrWhiteSpace(search)) {
            query = query.Where(c => EF.Functions.ILike(c.Title, $"%{search.Trim()}%"));
        }

        return await query
            .OrderByDescending(c => c.IsPinned)
            .ThenByDescending(c => c.LastMessageAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> CountByCandidateIdAsync(Guid candidateId, CancellationToken cancellationToken = default) {
        return await _dbContext.AiConversations
            .CountAsync(c => c.CandidateId == candidateId, cancellationToken);
    }

    public async Task<AiConversation?> GetOldestUnpinnedAsync(Guid candidateId, CancellationToken cancellationToken = default) {
        return await _dbContext.AiConversations
            .Where(c => c.CandidateId == candidateId && !c.IsPinned)
            .OrderBy(c => c.LastMessageAt)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task AddAsync(AiConversation conversation, CancellationToken cancellationToken = default) {
        await _dbContext.AiConversations.AddAsync(conversation, cancellationToken);
    }

    public async Task AddMessageAsync(AiMessage message, CancellationToken cancellationToken = default) {
        await _dbContext.AiMessages.AddAsync(message, cancellationToken);
    }

    public void Update(AiConversation conversation) {
        _dbContext.AiConversations.Update(conversation);
    }

    public void Delete(AiConversation conversation) {
        _dbContext.AiConversations.Remove(conversation);
    }

    public async Task<int> DeleteExpiredUnpinnedAsync(DateTimeOffset cutoff, CancellationToken cancellationToken = default) {
        var expired = await _dbContext.AiConversations
            .Where(c => !c.IsPinned && c.LastMessageAt < cutoff)
            .ToListAsync(cancellationToken);

        if (!expired.Any()) return 0;

        _dbContext.AiConversations.RemoveRange(expired);
        return await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> DeleteAllByCandidateIdAsync(Guid candidateId, CancellationToken cancellationToken = default) {
        var conversations = await _dbContext.AiConversations
            .Where(c => c.CandidateId == candidateId)
            .ToListAsync(cancellationToken);

        if (!conversations.Any()) return 0;

        _dbContext.AiConversations.RemoveRange(conversations);
        return conversations.Count;
    }
}
