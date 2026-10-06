using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Infrastructure.Persistence;

namespace SmartHire.Infrastructure;

public class EfUnitOfWork : IUnitOfWork {
    private readonly SmartHireDbContext _dbContext;
    
    public EfUnitOfWork(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public async Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> func,
        CancellationToken cancellationToken
    ) {
        await using var transaction =
            await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        
        try {
            var result = await func(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            
            return result;
        }
        catch {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}