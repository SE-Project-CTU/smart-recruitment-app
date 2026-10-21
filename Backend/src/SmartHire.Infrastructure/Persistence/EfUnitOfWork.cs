using Microsoft.EntityFrameworkCore;
using Npgsql;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Exceptions;
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

    public async Task SaveChangesAsync(CancellationToken cancellationToken) {
        try {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException exception) {
            throw new OptimisticConcurrencyException(exception);
        }
        catch (DbUpdateException exception) {
            if (TryGetUniqueConstraintName(exception, out var constraintName)) {
                throw new PersistenceUniqueConstraintViolationException(constraintName, exception);
            }

            throw;
        }
    }

    private static bool TryGetUniqueConstraintName(Exception exception, out string? constraintName) {
        constraintName = null;

        for (var current = exception; current is not null; current = current.InnerException) {
            if (current is not PostgresException postgresException ||
                postgresException.SqlState != PostgresErrorCodes.UniqueViolation) {
                continue;
            }

            constraintName = postgresException.ConstraintName;
            return true;
        }

        return false;
    }
}
