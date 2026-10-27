using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class CompanyRepository : ICompanyRepository {
    private readonly SmartHireDbContext _dbContext;

    public CompanyRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }

    // Company
    public async Task<Company?> GetByIdAsync(Guid id, CancellationToken cancellationToken) {
        return await _dbContext.Companies
            .Include(c => c.LogoFile)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<Company?> GetByTaxCodeAsync(string taxCode, CancellationToken cancellationToken) {
        return await _dbContext.Companies
            .FirstOrDefaultAsync(c => c.TaxCode == taxCode, cancellationToken);
    }

    public async Task<bool> ExistsByLogoFileIdAsync(Guid logoFileId, Guid? excludeCompanyId = null, CancellationToken cancellationToken = default) {
        var query = _dbContext.Companies
            .AsNoTracking()
            .Where(c => c.LogoFileId == logoFileId);

        if (excludeCompanyId.HasValue) {
            query = query.Where(c => c.Id != excludeCompanyId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<Company> Items, int TotalCount)> GetCompaniesPagedAsync(
        string? search,
        CompanyVerificationStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.Companies
            .AsNoTracking()
            .Include(c => c.LogoFile)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search)) {
            var trimmedSearch = search.Trim();
            query = query.Where(c => c.Name.Contains(trimmedSearch) || c.TaxCode.Contains(trimmedSearch));
        }

        if (status.HasValue) {
            query = query.Where(c => c.VerificationStatus == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddAsync(Company company, CancellationToken cancellationToken) {
        await _dbContext.Companies.AddAsync(company, cancellationToken);
    }

    // Membership
    public async Task<CompanyMembership?> GetMembershipAsync(Guid companyId, Guid userId, CancellationToken cancellationToken) {
        return await _dbContext.CompanyMemberships
            .Include(m => m.User)
            .ThenInclude(u => u.AvatarFile)
            .FirstOrDefaultAsync(m => m.CompanyId == companyId && m.UserId == userId, cancellationToken);
    }

    public async Task<CompanyMembership?> GetActiveOwnerMembershipAsync(Guid companyId, CancellationToken cancellationToken) {
        return await _dbContext.CompanyMemberships
            .FirstOrDefaultAsync(
                m => m.CompanyId == companyId &&
                     m.Role == CompanyMemberRole.Owner &&
                     m.Status == CompanyMembershipStatus.Active,
                cancellationToken);
    }

    public async Task<(IReadOnlyList<CompanyMembership> Items, int TotalCount)> GetMembersPagedAsync(
        Guid companyId,
        CompanyMembershipStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.CompanyMemberships
            .AsNoTracking()
            .Include(m => m.User)
                .ThenInclude(u => u.AvatarFile)
            .Where(m => m.CompanyId == companyId);

        if (status.HasValue) {
            query = query.Where(m => m.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(m => m.JoinedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<int> CountOwnedCompaniesAsync(Guid userId, CancellationToken cancellationToken) {
        return await _dbContext.CompanyMemberships
            .CountAsync(
                m => m.UserId == userId &&
                     m.Role == CompanyMemberRole.Owner &&
                     m.Status == CompanyMembershipStatus.Active,
                cancellationToken);
    }

    public async Task<(IReadOnlyList<CompanyMembership> Items, int TotalCount)> GetUserActiveCompaniesPagedAsync(
        Guid userId,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.CompanyMemberships
            .AsNoTracking()
            .Include(m => m.Company)
                .ThenInclude(c => c.LogoFile)
            .Where(m => m.UserId == userId && m.Status == CompanyMembershipStatus.Active);

        if (!string.IsNullOrWhiteSpace(search)) {
            var trimmedSearch = search.Trim();
            query = query.Where(m => m.Company.Name.Contains(trimmedSearch) || m.Company.TaxCode.Contains(trimmedSearch));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(m => m.JoinedAt)
            .ThenByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<List<Guid>> GetActiveCompanyIdsForUserAsync(Guid userId, CancellationToken cancellationToken) =>
        _dbContext.CompanyMemberships
            .AsNoTracking()
            .Where(m => m.UserId == userId && m.Status == CompanyMembershipStatus.Active)
            .Select(m => m.CompanyId)
            .ToListAsync(cancellationToken);

    public async Task AddMembershipAsync(CompanyMembership membership, CancellationToken cancellationToken) {
        await _dbContext.CompanyMemberships.AddAsync(membership, cancellationToken);
    }

    // Invitation
    public async Task<CompanyInvitation?> GetInvitationByIdAsync(Guid invitationId, CancellationToken cancellationToken) {
        return await _dbContext.CompanyInvitations
            .Include(i => i.Company)
                .ThenInclude(c => c.LogoFile)
            .Include(i => i.Inviter)
                .ThenInclude(m => m.User)
                    .ThenInclude(u => u.AvatarFile)
            .FirstOrDefaultAsync(i => i.Id == invitationId, cancellationToken);
    }

    public async Task<CompanyInvitation?> GetPendingInvitationAsync(Guid companyId, Guid inviteeId, CancellationToken cancellationToken) {
        return await _dbContext.CompanyInvitations
            .FirstOrDefaultAsync(
                i => i.CompanyId == companyId &&
                     i.InviteeId == inviteeId &&
                     i.Status == CompanyInvitationStatus.Pending,
                cancellationToken);
    }

    public async Task<(IReadOnlyList<CompanyInvitation> Items, int TotalCount)> GetMyInvitationsPagedAsync(
        Guid inviteeId,
        CompanyInvitationStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.CompanyInvitations
            .AsNoTracking()
            .Include(i => i.Company)
                .ThenInclude(c => c.LogoFile)
            .Include(i => i.Inviter)
                .ThenInclude(m => m.User)
                    .ThenInclude(u => u.AvatarFile)
            .Where(i => i.InviteeId == inviteeId);

        if (status.HasValue) {
            query = query.Where(i => i.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddInvitationAsync(CompanyInvitation invitation, CancellationToken cancellationToken) {
        await _dbContext.CompanyInvitations.AddAsync(invitation, cancellationToken);
    }

    // Join Request
    public async Task<CompanyJoinRequest?> GetJoinRequestByIdAsync(Guid requestId, CancellationToken cancellationToken) {
        return await _dbContext.CompanyJoinRequests
            .Include(r => r.User)
                .ThenInclude(u => u.AvatarFile)
            .FirstOrDefaultAsync(r => r.Id == requestId, cancellationToken);
    }

    public async Task<CompanyJoinRequest?> GetPendingJoinRequestAsync(Guid companyId, Guid userId, CancellationToken cancellationToken) {
        return await _dbContext.CompanyJoinRequests
            .FirstOrDefaultAsync(
                r => r.CompanyId == companyId &&
                     r.UserId == userId &&
                     r.Status == CompanyJoinRequestStatus.Pending,
                cancellationToken);
    }

    public async Task<(IReadOnlyList<CompanyJoinRequest> Items, int TotalCount)> GetJoinRequestsPagedAsync(
        Guid companyId,
        CompanyJoinRequestStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.CompanyJoinRequests
            .AsNoTracking()
            .Include(r => r.User)
                .ThenInclude(u => u.AvatarFile)
            .Where(r => r.CompanyId == companyId);

        if (status.HasValue) {
            query = query.Where(r => r.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task AddJoinRequestAsync(CompanyJoinRequest request, CancellationToken cancellationToken) {
        await _dbContext.CompanyJoinRequests.AddAsync(request, cancellationToken);
    }

    // Follow
    public Task<bool> IsFollowingAsync(Guid userId, Guid companyId, CancellationToken cancellationToken) =>
        _dbContext.CompanyFollows.AsNoTracking()
            .AnyAsync(f => f.UserId == userId && f.CompanyId == companyId, cancellationToken);

    public async Task<CompanyFollow?> GetFollowAsync(Guid userId, Guid companyId, CancellationToken cancellationToken) {
        return await _dbContext.CompanyFollows
            .FirstOrDefaultAsync(f => f.UserId == userId && f.CompanyId == companyId, cancellationToken);
    }

    public async Task<(IReadOnlyList<CompanyFollow> Items, int TotalCount)> GetFollowersPagedAsync(
        Guid companyId,
        int page,
        int pageSize,
        CancellationToken cancellationToken) {
        var query = _dbContext.CompanyFollows
            .AsNoTracking()
            .Include(f => f.User)
                .ThenInclude(u => u.AvatarFile)
            .Where(f => f.CompanyId == companyId);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public async Task<int> CountFollowersAsync(Guid companyId, CancellationToken cancellationToken) {
        return await _dbContext.CompanyFollows
            .CountAsync(f => f.CompanyId == companyId, cancellationToken);
    }

    public async Task<IReadOnlyList<Guid>> GetFollowerUserIdsAsync(
        Guid companyId,
        CancellationToken cancellationToken) {
        return await _dbContext.CompanyFollows
            .AsNoTracking()
            .Where(follow => follow.CompanyId == companyId)
            .Select(follow => follow.UserId)
            .ToListAsync(cancellationToken);
    }

    public async Task AddFollowAsync(CompanyFollow follow, CancellationToken cancellationToken) {
        await _dbContext.CompanyFollows.AddAsync(follow, cancellationToken);
    }

    public void DeleteFollow(CompanyFollow follow) {
        _dbContext.CompanyFollows.Remove(follow);
    }
}
