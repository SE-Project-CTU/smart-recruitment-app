using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;

namespace SmartHire.Application.Features.Cv.Queries.GetCvVersion;

public static class GetCvVersionQueryValidator
{
    public static GetCvVersionQuery Validate(GetCvVersionQuery query)
    {
        var details = new List<AppErrorDetail>();

        if (query.CvId == Guid.Empty)
        {
            details.Add(new AppErrorDetail(
                "id", ValidationReasons.InvalidFormat, "Provide a non-empty CV id."));
        }

        if (query.VersionId == Guid.Empty)
        {
            details.Add(new AppErrorDetail(
                "versionId", ValidationReasons.InvalidFormat,
                "Provide a non-empty CV version id."));
        }

        if (details.Count > 0)
        {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "CV and version ids must be valid UUIDs.",
                details);
        }

        return query;
    }
}
