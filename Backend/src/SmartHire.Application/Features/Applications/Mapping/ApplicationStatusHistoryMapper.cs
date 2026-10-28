using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Applications.Mapping;

internal static class ApplicationStatusHistoryMapper {
    public static ApplicationStatusHistoryResult ToResult(ApplicationStatusHistoryData history) => new(
        history.Id,
        history.ApplicationId,
        ApplicationStatusContract.ToApiValue(history.Status),
        new ApplicationStatusHistoryActorResult(
            history.ChangedBy.Id,
            history.ChangedBy.FullName,
            history.ChangedBy.Email,
            history.ChangedBy.AvatarUrl,
            history.ChangedBy.Role),
        history.Note,
        history.CreatedAt);
}
