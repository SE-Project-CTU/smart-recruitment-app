namespace SmartHire.Application.Abstractions.Persistence;

public interface IUnitOfWork {
    Task<T> ExecuteInTransactionAsync<T>(
        Func<CancellationToken, Task<T>> func,
        CancellationToken cancellationToken
    );
    
    Task SaveChangesAsync(CancellationToken cancellationToken);
}