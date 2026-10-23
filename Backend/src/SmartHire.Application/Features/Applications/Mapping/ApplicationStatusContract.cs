using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Mapping;

internal static class ApplicationStatusContract {
    public static bool TryParse(string value, out ApplicationStatus status) {
        status = value.Trim().ToUpperInvariant() switch {
            "SUBMITTED" => ApplicationStatus.Submitted,
            "RECEIVED" => ApplicationStatus.Received,
            "APPROVED" => ApplicationStatus.Approved,
            "REVIEWING" => ApplicationStatus.Reviewing,
            "SHORTLISTED" => ApplicationStatus.Shortlisted,
            "INTERVIEW" or "INTERVIEWING" => ApplicationStatus.Interviewing,
            "OFFERED" => ApplicationStatus.Offered,
            "HIRED" => ApplicationStatus.Hired,
            "REJECTED" => ApplicationStatus.Rejected,
            "WITHDRAWN" => ApplicationStatus.Withdrawn,
            _ => (ApplicationStatus)(-1)
        };
        return Enum.IsDefined(status);
    }

    public static bool TryParseUpdateTarget(string value, out ApplicationStatus status) {
        status = value.Trim().ToUpperInvariant() switch {
            "REVIEWING" => ApplicationStatus.Reviewing,
            "SHORTLISTED" => ApplicationStatus.Shortlisted,
            "INTERVIEW" or "INTERVIEWING" => ApplicationStatus.Interviewing,
            "OFFERED" => ApplicationStatus.Offered,
            "HIRED" => ApplicationStatus.Hired,
            "REJECTED" => ApplicationStatus.Rejected,
            "WITHDRAWN" => ApplicationStatus.Withdrawn,
            _ => (ApplicationStatus)(-1)
        };
        return Enum.IsDefined(status);
    }

    public static string ToApiValue(ApplicationStatus status) => status switch {
        ApplicationStatus.Submitted => "SUBMITTED",
        ApplicationStatus.Received => "RECEIVED",
        ApplicationStatus.Approved => "APPROVED",
        ApplicationStatus.Reviewing => "REVIEWING",
        ApplicationStatus.Shortlisted => "SHORTLISTED",
        ApplicationStatus.Interviewing => "INTERVIEW",
        ApplicationStatus.Offered => "OFFERED",
        ApplicationStatus.Hired => "HIRED",
        ApplicationStatus.Rejected => "REJECTED",
        ApplicationStatus.Withdrawn => "WITHDRAWN",
        _ => throw new ArgumentOutOfRangeException(nameof(status), status, null)
    };
}
