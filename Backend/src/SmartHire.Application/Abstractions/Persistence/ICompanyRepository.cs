using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Abstractions.Persistence;

public interface ICompanyRepository {
    // Company
    Task<Company?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<Company?> GetByTaxCodeAsync(string taxCode, CancellationToken cancellationToken);
    Task<bool> ExistsByLogoFileIdAsync(Guid logoFileId, Guid? excludeCompanyId = null, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Company> Items, int TotalCount)> GetCompaniesPagedAsync(
        string? search,
        CompanyVerificationStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task AddAsync(Company company, CancellationToken cancellationToken);

    // Membership
    Task<CompanyMembership?> GetMembershipAsync(Guid companyId, Guid userId, CancellationToken cancellationToken);
    Task<CompanyMembership?> GetMembershipByIdOrUserIdAsync(Guid companyId, Guid memberId, CancellationToken cancellationToken);
    Task<CompanyMembership?> GetActiveOwnerMembershipAsync(Guid companyId, CancellationToken cancellationToken);
    Task<(IReadOnlyList<CompanyMembership> Items, int TotalCount)> GetMembersPagedAsync(
        Guid companyId,
        CompanyMembershipStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task<(IReadOnlyList<CompanyMembership> Items, int TotalCount)> GetUserActiveCompaniesPagedAsync(
        Guid userId,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task<List<Guid>> GetActiveCompanyIdsForUserAsync(Guid userId, CancellationToken cancellationToken);
    Task<int> CountOwnedCompaniesAsync(Guid userId, CancellationToken cancellationToken);
    Task AddMembershipAsync(CompanyMembership membership, CancellationToken cancellationToken);

    // Invitation
    Task<CompanyInvitation?> GetInvitationByIdAsync(Guid invitationId, CancellationToken cancellationToken);
    Task<CompanyInvitation?> GetPendingInvitationAsync(Guid companyId, Guid inviteeId, CancellationToken cancellationToken);
    Task<(IReadOnlyList<CompanyInvitation> Items, int TotalCount)> GetMyInvitationsPagedAsync(
        Guid inviteeId,
        CompanyInvitationStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task AddInvitationAsync(CompanyInvitation invitation, CancellationToken cancellationToken);

    // Join Request
    Task<CompanyJoinRequest?> GetJoinRequestByIdAsync(Guid requestId, CancellationToken cancellationToken);
    Task<CompanyJoinRequest?> GetPendingJoinRequestAsync(Guid companyId, Guid userId, CancellationToken cancellationToken);
    Task<(IReadOnlyList<CompanyJoinRequest> Items, int TotalCount)> GetJoinRequestsPagedAsync(
        Guid companyId,
        CompanyJoinRequestStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task AddJoinRequestAsync(CompanyJoinRequest request, CancellationToken cancellationToken);

    // Follow
    Task<bool> IsFollowingAsync(Guid userId, Guid companyId, CancellationToken cancellationToken);
    Task<CompanyFollow?> GetFollowAsync(Guid userId, Guid companyId, CancellationToken cancellationToken);
    Task<(IReadOnlyList<CompanyFollow> Items, int TotalCount)> GetFollowersPagedAsync(
        Guid companyId,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task<(IReadOnlyList<FollowedCompanyResult> Items, int TotalCount)> GetFollowedCompaniesPagedAsync(
        Guid userId,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken);
    Task<int> CountFollowersAsync(Guid companyId, CancellationToken cancellationToken);
    Task<IReadOnlyList<Guid>> GetFollowerUserIdsAsync(Guid companyId, CancellationToken cancellationToken);
    Task AddFollowAsync(CompanyFollow follow, CancellationToken cancellationToken);
    void DeleteFollow(CompanyFollow follow);
}
