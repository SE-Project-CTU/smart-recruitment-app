using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Cv.Commands.CreateCv;
using SmartHire.Application.Features.Cv.Queries.GetMyCvs;
using SmartHire.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Features.Cv.DTOs;
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
    
    public async Task<Cv?> GetCvByIdAsync(Guid cvId, CancellationToken cancellationToken) {
        return await _dbContext.Cvs
            .AsNoTracking()
            .Where(cv => cv.Id == cvId && cv.DeletedAt == null)
            .Include(cv => cv.Template)
            .Include(cv => cv.PreviewFile)
            .SingleOrDefaultAsync(cancellationToken);
    }

    public Task<Guid?> GetCandidateIdByCvIdAsync(
        Guid cvId,
        CancellationToken cancellationToken) {
        return _dbContext.Cvs
            .AsNoTracking()
            .Where(cv => cv.Id == cvId && cv.DeletedAt == null)
            .Select(cv => (Guid?)cv.CandidateId)
            .SingleOrDefaultAsync(cancellationToken);
    }

    public Task<Cv?> GetForUpdateByIdAsync(Guid cvId, CancellationToken cancellationToken) {
        return _dbContext.Cvs
            .Include(cv => cv.Template)
            .Include(cv => cv.PreviewFile)
            .SingleOrDefaultAsync(
                cv => cv.Id == cvId && cv.DeletedAt == null,
                cancellationToken);
    }

    public Task<int> CountMineAsync(
        Guid candidateId,
        bool? isPublic,
        CvLanguage? language,
        CancellationToken cancellationToken) {
        return ApplyMineFilters(candidateId, isPublic, language).CountAsync(cancellationToken);
    }
    
    public Task<List<CvListItemResult>> GetMinePageAsync(
        Guid candidateId,
        bool? isPublic,
        CvLanguage? language,
        int skip,
        int pageSize,
        CancellationToken cancellationToken) {
        return ApplyMineFilters(candidateId, isPublic, language)
            .OrderByDescending(cv => cv.UpdatedAt)
            .ThenBy(cv => cv.Id)
            .Select(cv => new CvListItemResult(
                cv.Id,
                cv.CandidateId,
                cv.TemplateId,
                new CvTemplateSummaryResult(
                    cv.Template.Id,
                    cv.Template.Code,
                    cv.Template.Name),
                cv.Title,
                cv.Language,
                cv.IsPublic,
                cv.CreatedAt,
                cv.UpdatedAt,
                cv.PreviewFile != null ? new CvPreviewFileResult(cv.PreviewFile.Id, cv.PreviewFile.FileUrl) : null))
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> IsPreviewFileInUseAsync(
        Guid previewFileId,
        Guid? excludeCvId,
        CancellationToken cancellationToken) {
        var query = _dbContext.Cvs
            .AsNoTracking()
            .Where(cv => cv.PreviewFileId == previewFileId && cv.DeletedAt == null);

        if (excludeCvId.HasValue) {
            query = query.Where(cv => cv.Id != excludeCvId.Value);
        }

        return query.AnyAsync(cancellationToken);
    }
    
    private IQueryable<Cv> ApplyMineFilters(
        Guid candidateId,
        bool? isPublic,
        CvLanguage? language) {
        var query = _dbContext.Cvs
            .AsNoTracking()
            .Where(cv => cv.CandidateId == candidateId && cv.DeletedAt == null);
        
        if (isPublic is not null) {
            query = query.Where(cv => cv.IsPublic == isPublic);
        }
        
        if (language is not null) {
            query = query.Where(cv => cv.Language == language);
        }
        
        return query;
    }
}
