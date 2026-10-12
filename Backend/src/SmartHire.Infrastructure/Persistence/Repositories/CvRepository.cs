using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class CvRepository : ICvRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public CvRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public Task Add(Cv cv) {
        _dbContext.Cvs.Add(cv);
        return Task.CompletedTask;
    }
    
    public Task<Cv> GetMyCvAsync(Guid candidateId, CancellationToken cancellationToken) {
        throw new NotImplementedException();
    }
}