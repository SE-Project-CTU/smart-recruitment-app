using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyResultMapper {
    public static CompanyResult ToCompanyResult(
        Company company,
        string? logoUrl = null,
        CompanyMembershipSummary? membership = null) {
        ArgumentNullException.ThrowIfNull(company);

        return new CompanyResult(
            company.Id,
            company.Name,
            company.TaxCode,
            company.Email,
            company.Phone,
            company.Address,
            company.Website,
            company.Description,
            logoUrl ?? company.LogoFile?.FileUrl,
            company.VerificationStatus.ToString(),
            company.VerifiedAt,
            company.CreatedAt,
            company.UpdatedAt,
            membership);
    }

    public static CompanyMemberResult ToCompanyMemberResult(CompanyMembership membership) {
        ArgumentNullException.ThrowIfNull(membership);

        return new CompanyMemberResult(
            membership.Id,
            new CompanyMemberUserSummary(
                membership.User.Id,
                membership.User.FullName,
                membership.User.Email,
                membership.User.AvatarFile?.FileUrl),
            membership.Role.ToString(),
            membership.Status.ToString(),
            membership.JoinedAt);
    }

    public static CompanyInvitationResult ToCompanyInvitationResult(CompanyInvitation invitation, Company? company = null) {
        ArgumentNullException.ThrowIfNull(invitation);

        CompanyBriefSummary? briefCompany = null;
        var comp = company ?? invitation.Company;
        if (comp is not null) {
            briefCompany = new CompanyBriefSummary(comp.Id, comp.Name, comp.VerificationStatus.ToString());
        }

        return new CompanyInvitationResult(
            invitation.Id,
            invitation.CompanyId,
            invitation.InviterId,
            invitation.InviteeId,
            invitation.Status.ToString(),
            invitation.ExpiresAt,
            invitation.CreatedAt,
            briefCompany);
    }

    public static CompanyJoinRequestResult ToCompanyJoinRequestResult(CompanyJoinRequest request) {
        ArgumentNullException.ThrowIfNull(request);

        CompanyJoinRequestUserSummary? userSummary = null;
        if (request.User is not null) {
            userSummary = new CompanyJoinRequestUserSummary(request.User.Id, request.User.Email, request.User.FullName);
        }

        return new CompanyJoinRequestResult(
            request.Id,
            request.CompanyId,
            request.UserId,
            request.Status.ToString(),
            request.CreatedAt,
            userSummary);
    }
}
