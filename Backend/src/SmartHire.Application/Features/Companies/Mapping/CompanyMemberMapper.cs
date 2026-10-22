using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyMemberMapper {
    public static CompanyMemberResult ToResult(CompanyMembership membership) {
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
}
