using SmartHire.Application.Abstractions.Persistence.ReadModels;
using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Applications.Mapping;

internal static class ApplicationStatusHistoryMapper {
    public static ApplicationStatusHistoryResult ToResult(ApplicationStatusHistoryData history) => new(
        history.Id,
        history.ApplicationId,
        ApplicationStatusContract.ToApiValue(history.Status),
        history.ChangedBy,
        history.Note,
        history.CreatedAt);
}
