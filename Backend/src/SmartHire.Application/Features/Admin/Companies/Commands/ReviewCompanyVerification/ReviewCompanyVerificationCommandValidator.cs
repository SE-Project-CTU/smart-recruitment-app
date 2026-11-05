using SmartHire.Application.Common.Errors;
using SmartHire.Application.Features.Admin.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Companies.Commands.ReviewCompanyVerification;

public static class ReviewCompanyVerificationCommandValidator {
    public const int ReasonMinLength = 5;
    public const int ReasonMaxLength = 1000;

    public static ReviewCompanyVerificationCommand Validate(ReviewCompanyVerificationCommand command) {
        var details = new List<AppErrorDetail>();

        if (command.CompanyId == Guid.Empty) {
            details.Add(new AppErrorDetail("companyId", ValidationReasons.InvalidFormat, "Company ID must be a valid non-empty UUID."));
        }

        if (command.Status != CompanyVerificationStatus.Verified && command.Status != CompanyVerificationStatus.Rejected) {
            details.Add(new AppErrorDetail("verificationStatus", ValidationReasons.InvalidFormat, "Verification status must be VERIFIED or REJECTED."));
        }

        if (command.Status == CompanyVerificationStatus.Rejected) {
            if (string.IsNullOrWhiteSpace(command.Reason)) {
                details.Add(new AppErrorDetail("reason", ValidationReasons.Required, "Reason is required when rejecting company verification."));
            } else {
                var trimmed = command.Reason.Trim();
                if (trimmed.Length < ReasonMinLength) {
                    details.Add(new AppErrorDetail("reason", ValidationReasons.MinLength, $"Reason must be at least {ReasonMinLength} characters."));
                } else if (trimmed.Length > ReasonMaxLength) {
                    details.Add(new AppErrorDetail("reason", ValidationReasons.MaxLength, $"Reason must not exceed {ReasonMaxLength} characters."));
                }
            }
        }

        if (details.Count > 0) {
            throw AdminExceptions.Validation("Request contains invalid fields.", details);
        }

        return command with {
            Reason = command.Reason?.Trim()
        };
    }
}
