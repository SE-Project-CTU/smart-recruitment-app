namespace SmartHire.Application.Features.Notifications.Constants;

public static class NotificationGroups {
    public const string SystemAll = "system:all";

    public static string Company(Guid companyId) => $"company:{companyId:D}";

    public static string Role(string role) => $"role:{role.Trim().ToLowerInvariant()}";

    public static string Job(Guid jobId) => $"job:{jobId:D}";
}

