using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class CvVersionRepository : ICvVersionRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public CvVersionRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public Task Add(CvVersion cvVersion) {
        _dbContext.CvVersions.Add(cvVersion);
        return Task.CompletedTask;
    }
}