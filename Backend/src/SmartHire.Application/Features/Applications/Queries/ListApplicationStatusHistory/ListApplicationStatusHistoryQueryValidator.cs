using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Applications.Exceptions;

namespace SmartHire.Application.Features.Applications.Queries.ListApplicationStatusHistory;

internal static class ListApplicationStatusHistoryQueryValidator {
    public static ValidatedListApplicationStatusHistoryQuery Validate(
        ListApplicationStatusHistoryQuery query) {
        if (query.ApplicationId == Guid.Empty) {
            throw ApplicationExceptions.InvalidApplicationId();
        }

        var page = PagedListQueryValidator.ValidatePage(query.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(query.PageSize);

        return new ValidatedListApplicationStatusHistoryQuery(
            query.ApplicationId,
            page,
            pageSize,
            PagedListQueryValidator.CalculateSkip(page, pageSize));
    }
}
