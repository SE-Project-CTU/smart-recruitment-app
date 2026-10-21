using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Applications.Validation;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Queries.ListMyApplications;

internal static class ListMyApplicationsQueryValidator {
    public static ValidatedListMyApplicationsQuery Validate(ListMyApplicationsQuery query) {
        var page = PagedListQueryValidator.ValidatePage(query.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(query.PageSize);
        var skip = PagedListQueryValidator.CalculateSkip(page, pageSize);
        var details = new List<AppErrorDetail>();

        var status = ApplicationValidator.Parse(query.Status, details);

        var sort = ParseSort(query.Sort, details);
        var direction = SortDirectionValidator.Parse(query.Direction, details);
        if (details.Count > 0) {
            throw new AppException(
                AppErrorKind.BadRequest,
                ApplicationErrorCodes.InvalidApplicationQuery,
                "Application query contains invalid parameters.",
                details);
        }

        return new ValidatedListMyApplicationsQuery(page, pageSize, skip, status, sort, direction);
    }

    private static MyApplicationsSort ParseSort(string? value, ICollection<AppErrorDetail> details) {
        if (string.IsNullOrWhiteSpace(value) || value.Equals("appliedAt", StringComparison.OrdinalIgnoreCase))
            return MyApplicationsSort.AppliedAt;
        if (value.Equals("updatedAt", StringComparison.OrdinalIgnoreCase))
            return MyApplicationsSort.UpdatedAt;

        details.Add(new AppErrorDetail("sort", ValidationReasons.InvalidFormat,
            "Sort must be 'appliedAt' or 'updatedAt'."));
        return MyApplicationsSort.AppliedAt;
    }

}
