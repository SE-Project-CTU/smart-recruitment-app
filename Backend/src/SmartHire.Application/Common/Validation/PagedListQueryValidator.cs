using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Common.Validation;

/// <summary>
/// Shared validation and normalization rules for paginated list queries.
/// Feature-specific query validators should call these methods and add their own rules.
/// </summary>
public static class PagedListQueryValidator
{
    public const int FirstPage = 0;
    public const int MaximumPageSize = 100;
    public const int MaximumSearchLength = 100;

    public static int ValidatePage(int page)
    {
        if (page < 0)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidPageNumber,
                "Page must be greater than or equal to 0.",
                [new AppErrorDetail("page", ValidationReasons.InvalidFormat,
                    "Page must be greater than or equal to 0.")]);
        }

        return page;
    }

    public static int ValidatePageSize(int pageSize)
    {
        if (pageSize is < 1 or > MaximumPageSize)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidPageSize,
                $"Page size must be between 1 and {MaximumPageSize}.",
                [new AppErrorDetail("pageSize", ValidationReasons.InvalidFormat,
                    $"Page size must be between 1 and {MaximumPageSize}.")]);
        }

        return pageSize;
    }

    public static string? NormalizeSearch(string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return null;
        }

        var normalizedSearch = search.Trim();
        if (normalizedSearch.Length > MaximumSearchLength)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidSearchQuery,
                $"Search must not exceed {MaximumSearchLength} characters.",
                [new AppErrorDetail("search", ValidationReasons.MaxLength,
                    $"Search must not exceed {MaximumSearchLength} characters.")]);
        }

        return normalizedSearch;
    }

    public static int CalculateSkip(int page, int pageSize)
    {
        var skip = (long)page * pageSize;
        if (skip > int.MaxValue)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidPageNumber,
                "Page is too large.",
                [new AppErrorDetail("page", ValidationReasons.InvalidFormat,
                    "The requested page exceeds the supported range.")]);
        }

        return (int)skip;
    }
}
