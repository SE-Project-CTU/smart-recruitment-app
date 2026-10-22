using SmartHire.Application.Features.Notifications.DTOs;

namespace SmartHire.Application.Features.Notifications.Mapping;

public static class UnreadCountResultMapper {
    public static UnreadCountResult ToResult(int count) => new(count);
}
