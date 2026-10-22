using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Domain.Entities;

namespace SmartHire.Application.Features.Companies.Mapping;

public static class CompanyFollowerMapper {
    public static FollowCompanyResult ToFollowResult(
        Guid companyId,
        bool followed,
        DateTimeOffset createdAt) =>
        new(companyId, followed, createdAt);

    public static CompanyFollowerItem ToFollowerItem(CompanyFollow follow) {
        ArgumentNullException.ThrowIfNull(follow);

        return new CompanyFollowerItem(
            follow.UserId,
            follow.User.FullName,
            follow.User.AvatarFile?.FileUrl,
            follow.CreatedAt);
    }

    public static CompanyFollowersResponse ToFollowersResponse(
        Guid companyId,
        int followerCount,
        IReadOnlyList<CompanyFollowerItem> followers) =>
        new(companyId, followerCount, followers);
}
