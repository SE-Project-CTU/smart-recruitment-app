using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyInvitationMapper {
    public static CompanyInvitationResult ToResult(CompanyInvitation invitation, Company? company = null) {
        ArgumentNullException.ThrowIfNull(invitation);

        CompanyBriefSummary? briefCompany = null;
        var comp = company ?? invitation.Company;
        if (comp is not null) {
            briefCompany = new CompanyBriefSummary(
                comp.Id,
                comp.Name,
                comp.VerificationStatus.ToString(),
                comp.LogoFile?.FileUrl,
                comp.Address,
                comp.Website);
        }

        CompanyInvitationInviterSummary? inviterSummary = null;
        string? inviterEmail = null;
        if (invitation.Inviter?.User is not null) {
            inviterEmail = invitation.Inviter.User.Email;
            inviterSummary = new CompanyInvitationInviterSummary(
                invitation.Inviter.User.Id,
                invitation.Inviter.User.FullName,
                invitation.Inviter.User.Email,
                invitation.Inviter.User.AvatarFile?.FileUrl);
        }

        return new CompanyInvitationResult(
            invitation.Id,
            invitation.CompanyId,
            invitation.InviterId,
            invitation.InviteeId,
            invitation.Status.ToString(),
            invitation.ExpiresAt,
            invitation.CreatedAt,
            briefCompany,
            inviterSummary,
            inviterEmail);
    }

    public static AcceptInvitationResult ToAcceptResult(CompanyInvitation invitation, CompanyMembership membership) {
        ArgumentNullException.ThrowIfNull(invitation);
        ArgumentNullException.ThrowIfNull(membership);

        return new AcceptInvitationResult(
            invitation.Id,
            invitation.Status.ToString(),
            new AcceptInvitationMembershipResult(
                membership.Id,
                membership.CompanyId,
                membership.UserId,
                membership.Role.ToString(),
                membership.Status.ToString(),
                membership.JoinedAt));
    }
}
