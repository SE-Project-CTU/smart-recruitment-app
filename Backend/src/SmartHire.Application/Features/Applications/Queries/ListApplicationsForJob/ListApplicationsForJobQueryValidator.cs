using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Applications.Validation;
using SmartHire.Application.Features.JobPostings.Exceptions;

namespace SmartHire.Application.Features.Applications.Queries.ListApplicationsForJob;

internal static class ListApplicationsForJobQueryValidator {
    public static ValidatedListApplicationsForJobQuery Validate(ListApplicationsForJobQuery query) {
        if (!Guid.TryParse(query.JobPostingId, out var jobPostingId) || jobPostingId == Guid.Empty) {
            throw JobPostingExceptions.InvalidJobPostingId();
        }

        var page = PagedListQueryValidator.ValidatePage(query.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(query.PageSize);
        var details = new List<AppErrorDetail>();
        var status = ApplicationValidator.Parse(query.Status, details);
        var sort = ParseSort(query.Sort, details);
        var direction = SortDirectionValidator.Parse(query.Direction, details);
        if (details.Count > 0) {
            throw ApplicationExceptions.InvalidQuery(details);
        }

        return new ValidatedListApplicationsForJobQuery(
            jobPostingId,
            status,
            sort,
            direction,
            page,
            pageSize,
            PagedListQueryValidator.CalculateSkip(page, pageSize));
    }

    private static JobApplicationsSort ParseSort(string? value, ICollection<AppErrorDetail> details) {
        if (string.IsNullOrWhiteSpace(value) || value.Equals("createdAt", StringComparison.OrdinalIgnoreCase)) {
            return JobApplicationsSort.CreatedAt;
        }

        details.Add(new AppErrorDetail("sort", ValidationReasons.InvalidFormat,
            "Sort must be 'createdAt'."));
        return JobApplicationsSort.CreatedAt;
    }
}
