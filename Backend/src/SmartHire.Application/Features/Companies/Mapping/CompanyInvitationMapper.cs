using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyInvitationMapper {
    public static CompanyInvitationResult ToResult(CompanyInvitation invitation, Company? company = null) {
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
