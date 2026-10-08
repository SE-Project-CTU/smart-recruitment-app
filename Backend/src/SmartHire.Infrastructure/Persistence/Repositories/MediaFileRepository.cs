using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public class MediaFileRepository : IMediaFileRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public MediaFileRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public Task<MediaFile?> GetByIdAsync(Guid fileId, CancellationToken cancellationToken) {
        return _dbContext.MediaFiles
            .AsNoTracking()
            .SingleOrDefaultAsync(file => file.Id == fileId, cancellationToken);
    }
}
