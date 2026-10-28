using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Sorting;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Applications.Validation;

namespace SmartHire.Application.Features.Companies.Queries.ListCompanyApplications;

internal static class ListCompanyApplicationsQueryValidator {
    public static ValidatedListCompanyApplicationsQuery Validate(ListCompanyApplicationsQuery query) {
        var pagination = query.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var details = new List<AppErrorDetail>();
        var status = ApplicationValidator.Parse(query.Filter?.Status, details);
        var sort = ParseSort(query.Sort?.Sort, details);
        var direction = SortDirectionValidator.Parse(query.Sort?.Direction, details);
        var search = PagedListQueryValidator.NormalizeSearch(query.Filter?.Search);

        if (details.Count > 0) {
            throw ApplicationExceptions.InvalidQuery(details);
        }

        return new ValidatedListCompanyApplicationsQuery(
            query.CompanyId,
            query.Filter?.JobId,
            status,
            search,
            sort,
            direction,
            page,
            pageSize,
            PagedListQueryValidator.CalculateSkip(page, pageSize));
    }

    private static CompanyApplicationsSort ParseSort(string? value, ICollection<AppErrorDetail> details) {
        if (string.IsNullOrWhiteSpace(value)
            || value.Equals("appliedAt", StringComparison.OrdinalIgnoreCase)
            || value.Equals("createdAt", StringComparison.OrdinalIgnoreCase)) {
            return CompanyApplicationsSort.AppliedAt;
        }

        if (value.Equals("candidateName", StringComparison.OrdinalIgnoreCase)
            || value.Equals("candidate", StringComparison.OrdinalIgnoreCase)
            || value.Equals("fullName", StringComparison.OrdinalIgnoreCase)) {
            return CompanyApplicationsSort.CandidateName;
        }

        if (value.Equals("jobTitle", StringComparison.OrdinalIgnoreCase)
            || value.Equals("title", StringComparison.OrdinalIgnoreCase)) {
            return CompanyApplicationsSort.JobTitle;
        }

        if (value.Equals("status", StringComparison.OrdinalIgnoreCase)) {
            return CompanyApplicationsSort.Status;
        }

        details.Add(new AppErrorDetail("sort", ValidationReasons.InvalidFormat,
            "Sort must be one of: 'appliedAt', 'candidateName', 'jobTitle', 'status'."));
        return CompanyApplicationsSort.AppliedAt;
    }
}
