using System.Text.Json;
using System.Text.Json.Serialization;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Notifications;

/// <summary>
/// Creates a persisted candidate notification after an application status transition.
/// </summary>
internal static class ApplicationStatusUpdateNotificationFactory {
    public static Notification Create(JobApplication application, DateTimeOffset now) {
        ArgumentNullException.ThrowIfNull(application);

        var company = application.Job.Company;
        var job = application.Job;
        var status = ApplicationStatusContract.ToApiValue(application.Status);
        var statusLabel = GetStatusLabel(application.Status);
        var payload = JsonSerializer.Serialize(new ApplicationStatusUpdatePayload(
            application.Id,
            job.Id,
            company.Id,
            company.Name,
            status));

        return Notification.Create(
            recipientId: application.CandidateId,
            type: NotificationType.ApplicationStatusUpdate,
            title: $"Cập nhật hồ sơ ứng tuyển từ {company.Name}",
            body: $"Hồ sơ ứng tuyển vị trí {job.Title} tại {company.Name} đã được cập nhật sang trạng thái: {statusLabel}.",
            payload: payload,
            resourceType: "JobApplication",
            resourceId: application.Id,
            now: now);
    }

    private static string GetStatusLabel(ApplicationStatus status) => status switch {
        ApplicationStatus.Reviewing => "Đang xem xét",
        ApplicationStatus.Shortlisted => "Được chọn vào vòng tiếp theo",
        ApplicationStatus.Interviewing => "Đang phỏng vấn",
        ApplicationStatus.Offered => "Được mời nhận việc",
        ApplicationStatus.Hired => "Đã được tuyển dụng",
        ApplicationStatus.Rejected => "Bị từ chối",
        ApplicationStatus.Withdrawn => "Đã rút hồ sơ",
        _ => throw new ArgumentOutOfRangeException(nameof(status), status,
            "Only application workflow transition statuses can be notified.")
    };

    private sealed record ApplicationStatusUpdatePayload(
        [property: JsonPropertyName("application_id")] Guid ApplicationId,
        [property: JsonPropertyName("job_id")] Guid JobId,
        [property: JsonPropertyName("company_id")] Guid CompanyId,
        [property: JsonPropertyName("company_name")] string CompanyName,
        [property: JsonPropertyName("status")] string Status);
}
