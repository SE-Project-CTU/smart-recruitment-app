using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Features.Cv.Queries.GetCvVersions;

public sealed record ValidatedGetCvVersionsQuery(
    Guid CvId,
    int Page,
    int PageSize,
    int Skip);

public static class GetCvVersionsQueryValidator
{
    public static ValidatedGetCvVersionsQuery Validate(GetCvVersionsQuery query)
    {
        if (query.CvId == Guid.Empty)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "CV id must be a valid UUID.",
                [new AppErrorDetail("id", ValidationReasons.InvalidFormat,
                    "Provide a non-empty CV id.")]);
        }

        var page = PagedListQueryValidator.ValidatePage(query.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(query.PageSize);

        return new ValidatedGetCvVersionsQuery(
            query.CvId,
            page,
            pageSize,
            PagedListQueryValidator.CalculateSkip(page, pageSize));
    }
}
