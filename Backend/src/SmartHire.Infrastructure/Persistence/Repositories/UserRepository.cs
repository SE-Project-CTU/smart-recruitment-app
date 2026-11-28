using Microsoft.EntityFrameworkCore;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Admin.Users.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Infrastructure.Persistence.Repositories;

public sealed class UserRepository : IUserRepository {
    private readonly SmartHireDbContext _dbContext;
    
    public UserRepository(SmartHireDbContext dbContext) {
        _dbContext = dbContext;
    }
    
    public Task<bool> EmailExistsAsync(string normalizedEmail, CancellationToken cancellationToken) {
        return _dbContext.Users.AnyAsync(
            user => user.Email == normalizedEmail,
            cancellationToken
        );
    }
    
    public Task<bool> PhoneExistsAsync(string normalizedPhone, CancellationToken cancellationToken) {
        return _dbContext.Users.AnyAsync(
            user => user.Phone == normalizedPhone,
            cancellationToken
        );
    }
    
    public async Task AddAsync(User user, CancellationToken cancellationToken) {
        await _dbContext.Users.AddAsync(user, cancellationToken);
    }

    public Task SaveChangeAsync(CancellationToken cancellationToken) =>
        _dbContext.SaveChangesAsync(cancellationToken);
    
    public async Task<User?> GetByEmailWithRolesAsync(string normalizedEmail, CancellationToken cancellationToken) {
        return await _dbContext.Users
            .AsNoTracking()
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .Include(user => user.AvatarFile)
            .SingleOrDefaultAsync(
                user => user.Email == normalizedEmail,
                cancellationToken
            );
    }

    public async Task<User?> GetTrackedForGoogleAuthAsync(
        string firebaseUid,
        string normalizedEmail,
        CancellationToken cancellationToken
    ) {
        var candidates = await _dbContext.Users
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .Include(user => user.AvatarFile)
            .Where(user => user.FirebaseUid == firebaseUid || user.Email == normalizedEmail)
            .ToListAsync(cancellationToken);

        return candidates.FirstOrDefault(u => u.FirebaseUid == firebaseUid)
            ?? candidates.FirstOrDefault();
    }
    
    public Task<CurrentAccountData?> GetCurrentAccountAsync(Guid userId, CancellationToken cancellationToken) {
        return _dbContext.Users
            .Where(user => user.Id == userId)
            .Select(user => new CurrentAccountData(
                user.Id,
                user.Email,
                user.Phone,
                user.FullName,
                user.AvatarFile != null
                    ? user.AvatarFile.FileUrl
                    : user.ExternalAvatarUrl,
                user.UserRoles
                    .Select(userRole => userRole.Role.Name)
                    .ToList(),
                user.Status,
                user.CreatedAt,
                user.UpdatedAt
            ))
            .SingleOrDefaultAsync(cancellationToken);
    }
    
    public Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken) {
        return _dbContext.Users.SingleOrDefaultAsync(
            user => user.Id == userId,
            cancellationToken
        );
    }

    public Task<User?> GetByIdWithRolesAsync(Guid userId, CancellationToken cancellationToken) {
        return _dbContext.Users
            .Include(user => user.UserRoles)
            .ThenInclude(userRole => userRole.Role)
            .SingleOrDefaultAsync(
                user => user.Id == userId,
                cancellationToken
            );
    }
    
    public Task<bool> PhoneExistsForOtherUserAsync(
        string normalizedPhone,
        Guid currentUserId,
        CancellationToken cancellationToken
    ) {
        return _dbContext.Users.AnyAsync(
            user => user.Id != currentUserId &&
                    user.Phone == normalizedPhone,
            cancellationToken
        );
    }

    public async Task<(IReadOnlyList<AdminUserItemDto> Items, int TotalCount)> GetAdminUsersPagedAsync(
        string? search,
        string? role,
        UserStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken
    ) {
        var query = _dbContext.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search)) {
            var s = search.Trim().ToLower();
            query = query.Where(u =>
                u.Email.ToLower().Contains(s) ||
                u.FullName.ToLower().Contains(s) ||
                (u.Phone != null && u.Phone.Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(role)) {
            var r = role.Trim().ToLower();
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name.ToLower() == r));
        }

        if (status.HasValue) {
            query = query.Where(u => u.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserItemDto(
                u.Id,
                u.Email,
                u.FullName,
                u.Phone,
                u.AvatarFile != null ? u.AvatarFile.FileUrl : u.ExternalAvatarUrl,
                u.Status.ToString().ToUpperInvariant(),
                u.UserRoles.Select(ur => ur.Role.Name).ToList(),
                u.CreatedAt,
                u.UpdatedAt
            ))
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    public Task<int> CountActiveAdminsAsync(CancellationToken cancellationToken) {
        return _dbContext.Users
            .Where(u => u.Status == UserStatus.Active && u.UserRoles.Any(ur => ur.Role.Name == RoleNames.Admin))
            .CountAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Guid>> GetActiveUserIdsByRoleAsync(
        string? role,
        CancellationToken cancellationToken
    ) {
        var query = _dbContext.Users
            .AsNoTracking()
            .Where(u => u.Status == UserStatus.Active);

        if (!string.IsNullOrWhiteSpace(role)) {
            var normalizedRole = role.Trim().ToLower();
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name.ToLower() == normalizedRole));
        } else {
            // SystemAll: Gửi tới Candidate và Recruiter, loại trừ Admin
            query = query.Where(u => !u.UserRoles.Any(ur => ur.Role.Name == RoleNames.Admin));
        }

        return await query.Select(u => u.Id).ToListAsync(cancellationToken);
    }
}
