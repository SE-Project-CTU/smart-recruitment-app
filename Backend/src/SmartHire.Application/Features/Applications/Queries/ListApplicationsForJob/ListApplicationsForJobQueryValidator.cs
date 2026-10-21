using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
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
        if (details.Count > 0) {
            throw new AppException(
                AppErrorKind.BadRequest,
                ApplicationErrorCodes.InvalidApplicationQuery,
                "Application query contains invalid parameters.",
                details);
        }

        return new ValidatedListApplicationsForJobQuery(
            jobPostingId,
            status,
            page,
            pageSize,
            PagedListQueryValidator.CalculateSkip(page, pageSize));
    }
}
