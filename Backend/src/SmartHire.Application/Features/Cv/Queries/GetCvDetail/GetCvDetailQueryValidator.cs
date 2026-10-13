using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Cv.Queries.GetCvDetaill;

namespace SmartHire.Application.Features.Cv.Queries.GetCvDetail;

public static class GetCvDetailQueryValidator {
    public static GetCvDetailQuery Validate(GetCvDetailQuery query) {
        if (query.Id == Guid.Empty) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "CV id must be a valid UUID.",
                [
                    new AppErrorDetail(
                        "id",
                        ValidationReasons.InvalidFormat,
                        "Provide a non-empty CV id.")
                ]);
        }
        
        return query;
    }
}