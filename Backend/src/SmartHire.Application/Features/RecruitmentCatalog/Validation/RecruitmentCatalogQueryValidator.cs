using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.RecruitmentCatalog.Validation;

public static class RecruitmentCatalogQueryValidator
{
    private const int MaximumPage = 100_000;
    private const int MaximumPageSize = 100;
    private const int MaximumSearchLength = 100;

    public static ValidatedCatalogPage Validate(int page, int pageSize, string? search)
    {
        if (page is < 1 or > MaximumPage)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidPageNumber,
                $"Page must be between 1 and {MaximumPage}.",
                [new AppErrorDetail("page", ValidationReasons.InvalidFormat,
                    $"Page must be between 1 and {MaximumPage}.")]);
        }

        if (pageSize is < 1 or > MaximumPageSize)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidPageSize,
                $"Page size must be between 1 and {MaximumPageSize}.",
                [new AppErrorDetail("pageSize", ValidationReasons.InvalidFormat,
                    $"Page size must be between 1 and {MaximumPageSize}.")]);
        }

        var normalizedSearch = string.IsNullOrWhiteSpace(search) ? null : search.Trim();
        if (normalizedSearch is { Length: > MaximumSearchLength })
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidSearchQuery,
                $"Search must not exceed {MaximumSearchLength} characters.",
                [new AppErrorDetail("search", ValidationReasons.MaxLength,
                    $"Search must not exceed {MaximumSearchLength} characters.")]);
        }

        var skip = (long)(page - 1) * pageSize;
        if (skip > int.MaxValue)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidPageNumber,
                "Page is too large.",
                [new AppErrorDetail("page", ValidationReasons.InvalidFormat,
                    "The requested page exceeds the supported range.")]);
        }

        return new ValidatedCatalogPage(page, pageSize, (int)skip, normalizedSearch);
    }
}

public sealed record ValidatedCatalogPage(int Page, int PageSize, int Skip, string? Search);
