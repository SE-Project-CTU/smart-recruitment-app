using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class CvTemplateRepository : ICvTemplateRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public CvTemplateRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public Task<CvTemplate?> GetByIdAsync(Guid id, bool tracking, CancellationToken cancellationToken) {
        var query = _dbContext.CvTemplates.AsQueryable();
        
        if (!tracking) {
            query = query.AsNoTracking();
        }
        
        return query.SingleOrDefaultAsync(
            template => template.Id == id,
            cancellationToken
        );
    }

    public Task<CvTemplate?> GetActiveByIdAsync(Guid id, CancellationToken cancellationToken) {
        return _dbContext.CvTemplates
            .AsNoTracking()
            .Include(template => template.ThumbnailFile)
            .SingleOrDefaultAsync(
                template => template.Id == id && template.IsActive,
                cancellationToken);
    }
    
    public Task<CvTemplate?> GetByCodeAsync(string code, bool tracking, CancellationToken cancellationToken) {
        var query = _dbContext.CvTemplates.AsQueryable();
        
        if (!tracking) {
            query = query.AsNoTracking();
        }
        
        return query.SingleOrDefaultAsync(
            template => template.Code == code,
            cancellationToken
        );
    }
    
    public Task<int> CountActiveAsync(string? search, CancellationToken cancellationToken) {
        return ApplyActiveSearch(_dbContext.CvTemplates.AsNoTracking(), search)
            .CountAsync(cancellationToken);
    }
    
    public Task<List<CvTemplate>> GetActivePageAsync(
        string? search,
        int skip,
        int pageSize,
        CancellationToken cancellationToken
    ) {
        return ApplyActiveSearch(_dbContext.CvTemplates.AsNoTracking(), search)
            .OrderBy(template => template.Name)
            .ThenBy(template => template.Id)
            .Skip(skip)
            .Take(pageSize)
            .Include(template => template.ThumbnailFile)
            .ToListAsync(cancellationToken);
    }

    private static IQueryable<CvTemplate> ApplyActiveSearch(
        IQueryable<CvTemplate> query,
        string? search
    ) {
        query = query.Where(template => template.IsActive);

        if (!string.IsNullOrWhiteSpace(search)) {
            var pattern = $"%{search}%";
            query = query.Where(template =>
                EF.Functions.ILike(template.Name, pattern) ||
                EF.Functions.ILike(template.Code, pattern));
        }

        return query;
    }
}
