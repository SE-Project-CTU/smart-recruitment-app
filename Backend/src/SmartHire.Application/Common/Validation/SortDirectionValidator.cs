using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Sorting;

namespace SmartHire.Application.Common.Validation;

public static class SortDirectionValidator {
    public static SortDirection Parse(string? value, ICollection<AppErrorDetail> details) {
        if (string.IsNullOrWhiteSpace(value) || value.Equals("desc", StringComparison.OrdinalIgnoreCase)) {
            return SortDirection.Desc;
        }

        if (value.Equals("asc", StringComparison.OrdinalIgnoreCase)) {
            return SortDirection.Asc;
        }

        details.Add(new AppErrorDetail(
            "direction",
            ValidationReasons.InvalidFormat,
            "Direction must be 'asc' or 'desc'."));
        return SortDirection.Desc;
    }
}
