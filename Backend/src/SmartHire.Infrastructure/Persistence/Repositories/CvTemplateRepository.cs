using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
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

    // Admin methods
    public async Task<(IReadOnlyList<AdminCvTemplateItemDto> Items, int TotalCount)> GetAdminCvTemplatesPagedAsync(
        string? search,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.CvTemplates.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search.Trim()}%";
            query = query.Where(t => EF.Functions.ILike(t.Name, pattern) || EF.Functions.ILike(t.Code, pattern));
        }

        if (isActive.HasValue)
        {
            query = query.Where(t => t.IsActive == isActive.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(t => t.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new AdminCvTemplateItemDto(
                t.Id,
                t.Code,
                t.Name,
                t.Description,
                t.ThumbnailFile != null ? t.ThumbnailFile.FileUrl : null,
                t.Version,
                t.Language.ToString().ToUpperInvariant(),
                t.IsActive,
                t.CreatedAt,
                t.UpdatedAt
            ))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<CvTemplate?> GetAdminCvTemplateByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return _dbContext.CvTemplates
            .Include(t => t.ThumbnailFile)
            .SingleOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public Task<bool> CodeExistsAsync(string code, Guid? excludeId, CancellationToken cancellationToken)
    {
        var normalized = code.Trim().ToLowerInvariant();
        var query = _dbContext.CvTemplates.Where(t => t.Code == normalized);
        if (excludeId.HasValue)
        {
            query = query.Where(t => t.Id != excludeId.Value);
        }
        return query.AnyAsync(cancellationToken);
    }

    public async Task AddCvTemplateAsync(CvTemplate template, CancellationToken cancellationToken)
    {
        await _dbContext.CvTemplates.AddAsync(template, cancellationToken);
    }

    public Task<bool> HasLinkedCvsAsync(Guid templateId, CancellationToken cancellationToken)
    {
        return _dbContext.Cvs.AnyAsync(cv => cv.TemplateId == templateId, cancellationToken);
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
