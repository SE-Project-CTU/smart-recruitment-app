using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyResultMapper {
    public static CompanyResult ToCompanyResult(
        Company company,
        string? logoUrl = null,
        CompanyMembershipSummary? membership = null) =>
        CompanyDetailMapper.ToResult(company, logoUrl, membership);

    public static CompanyMemberResult ToCompanyMemberResult(CompanyMembership membership) =>
        CompanyMemberMapper.ToResult(membership);

    public static CompanyInvitationResult ToCompanyInvitationResult(CompanyInvitation invitation, Company? company = null) =>
        CompanyInvitationMapper.ToResult(invitation, company);

    public static AcceptInvitationResult ToAcceptInvitationResult(CompanyInvitation invitation, CompanyMembership membership) =>
        CompanyInvitationMapper.ToAcceptResult(invitation, membership);

    public static CompanyJoinRequestResult ToCompanyJoinRequestResult(CompanyJoinRequest request) =>
        CompanyJoinRequestMapper.ToResult(request);

    public static ReviewJoinRequestResult ToReviewJoinRequestResult(
        CompanyJoinRequest joinRequest,
        string status,
        AcceptInvitationMembershipResult? membership = null) =>
        CompanyJoinRequestMapper.ToReviewResult(joinRequest, status, membership);

    public static TransferOwnershipResult ToTransferOwnershipResult(
        Guid companyId,
        Guid previousOwnerId,
        Guid newOwnerId,
        DateTimeOffset transferredAt) =>
        CompanyOwnershipMapper.ToTransferResult(companyId, previousOwnerId, newOwnerId, transferredAt);

    public static FollowCompanyResult ToFollowCompanyResult(
        Guid companyId,
        bool followed,
        DateTimeOffset createdAt) =>
        CompanyFollowerMapper.ToFollowResult(companyId, followed, createdAt);

    public static CompanyFollowerItem ToCompanyFollowerItem(CompanyFollow follow) =>
        CompanyFollowerMapper.ToFollowerItem(follow);

    public static CompanyFollowersResponse ToCompanyFollowersResponse(
        Guid companyId,
        int followerCount,
        IReadOnlyList<CompanyFollowerItem> followers) =>
        CompanyFollowerMapper.ToFollowersResponse(companyId, followerCount, followers);
}
