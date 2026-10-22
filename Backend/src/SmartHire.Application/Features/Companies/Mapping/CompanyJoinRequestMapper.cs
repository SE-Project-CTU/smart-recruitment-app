using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyJoinRequestMapper {
    public static CompanyJoinRequestResult ToResult(CompanyJoinRequest request) {
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

    public static ReviewJoinRequestResult ToReviewResult(
        CompanyJoinRequest joinRequest,
        string status,
        AcceptInvitationMembershipResult? membership = null) {
        ArgumentNullException.ThrowIfNull(joinRequest);

        return new ReviewJoinRequestResult(
            joinRequest.Id,
            joinRequest.CompanyId,
            status,
            joinRequest.ReviewedBy,
            joinRequest.ReviewedAt,
            membership);
    }
}
