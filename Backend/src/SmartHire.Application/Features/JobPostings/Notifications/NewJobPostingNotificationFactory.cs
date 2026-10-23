using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Notifications;

/// <summary>
/// Builds persistent notifications for the followers of a company when a job is posted.
/// </summary>
public static class NewJobPostingNotificationFactory {
    public static IReadOnlyList<Notification> CreateForFollowers(
        Company company,
        JobPosting jobPosting,
        IEnumerable<Guid> followerUserIds,
        DateTimeOffset now) {
        ArgumentNullException.ThrowIfNull(company);
        ArgumentNullException.ThrowIfNull(jobPosting);
        ArgumentNullException.ThrowIfNull(followerUserIds);

        var title = $"Công ty {company.Name} vừa đăng tuyển vị trí mới";
        var body = BuildBody(jobPosting);
        var payload = JsonSerializer.Serialize(new NewJobPostingPayload(
            company.Id,
            company.Name,
            jobPosting.Id));

        return followerUserIds
            .Distinct()
            .Select(recipientId => Notification.Create(
                recipientId: recipientId,
                type: NotificationType.CompanyNewJobPosting,
                title: title,
                body: body,
                payload: payload,
                resourceType: "JobPosting",
                resourceId: jobPosting.Id,
                expiresAt: jobPosting.Deadline,
                now: now))
            .ToArray();
    }

    private static string BuildBody(JobPosting jobPosting) {
        var workMode = jobPosting.WorkMode switch {
            WorkMode.Remote => "Remote",
            WorkMode.Onsite => "Onsite",
            WorkMode.Hybrid => "Hybrid",
            _ => throw new ArgumentOutOfRangeException(nameof(jobPosting.WorkMode))
        };

        string salary;
        if (jobPosting.SalaryNegotiable) {
            salary = "Lương thỏa thuận";
        }
        else if (jobPosting.SalaryMin is decimal minimum &&
                 jobPosting.SalaryMax is decimal maximum) {
            salary = $"Mức lương {FormatAmount(minimum)}–{FormatAmount(maximum)}";
        }
        else if (jobPosting.SalaryMax is decimal maximumOnly) {
            salary = $"Lương lên đến {FormatAmount(maximumOnly)}";
        }
        else if (jobPosting.SalaryMin is decimal minimumOnly) {
            salary = $"Lương từ {FormatAmount(minimumOnly)}";
        }
        else {
            salary = "Mức lương chưa cập nhật";
        }

        return $"{jobPosting.Title} ({workMode}) - {salary}";
    }

    private static string FormatAmount(decimal amount) =>
        amount.ToString("N0", CultureInfo.InvariantCulture);

    private sealed record NewJobPostingPayload(
        [property: JsonPropertyName("company_id")] Guid CompanyId,
        [property: JsonPropertyName("company_name")] string CompanyName,
        [property: JsonPropertyName("job_id")] Guid JobId);
}
