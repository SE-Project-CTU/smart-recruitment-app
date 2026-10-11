using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Cv.Validation;

/// <summary>
/// Shared query-parameter rules for paginated CV and CV-template endpoints.
/// Endpoint-specific validators should call these methods and add their own rules.
/// </summary>
public static class CvQueryValidator
{
    public const int MaximumPageSize = 100;
    public const int MaximumSearchLength = 100;

    public static int ValidatePage(int page)
    {
        if (page < 0)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.InvalidPageNumber,
                "Page must be greater than or equal to 0.");
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
                $"Page size must be between 1 and {MaximumPageSize}.");
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
                $"Search must not exceed {MaximumSearchLength} characters.");
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
                "Page is too large.");
        }

        return (int)skip;
    }
}
