using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Validation;
using SmartHire.Domain.Enums;
using SmartHire.Domain.Validation;

namespace SmartHire.Application.Features.Cv.Queries.GetMyCvs;

public sealed record ValidatedGetMyCvsQuery(
    int Page,
    int PageSize,
    int Skip,
    bool? IsPublic,
    CvLanguage? Language);

public static class GetMyCvsQueryValidator {
    public static ValidatedGetMyCvsQuery Validate(GetMyCvsQuery query) {
        var page = PagedListQueryValidator.ValidatePage(query.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(query.PageSize);
        var language = NormalizeLanguage(query.Language);

        return new ValidatedGetMyCvsQuery(
            page,
            pageSize,
            PagedListQueryValidator.CalculateSkip(page, pageSize),
            query.IsPublic,
            language);
    }

    private static CvLanguage? NormalizeLanguage(string? language) {
        if (string.IsNullOrWhiteSpace(language)) {
            return null;
        }

        var normalizedLanguage = language.Trim().ToLowerInvariant();
        var issue = CvValidator.ValidateLanguageCode(normalizedLanguage);
        if (issue is not null) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                issue.Message,
                [new AppErrorDetail(
                    issue.Field,
                    ValidationReasons.InvalidFormat,
                    issue.Message)]);
        }

        return CvValidator.ParseLanguageCode(normalizedLanguage);
    }
}
