using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Validation;

internal static class ApplicationValidator {
    public static ApplicationStatus? Parse(string? value, ICollection<AppErrorDetail> details) {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (ApplicationStatusContract.TryParse(value, out var status)) return status;

        details.Add(new AppErrorDetail("status", ValidationReasons.InvalidFormat,
            "Status is not supported."));
        return null;
    }
}
