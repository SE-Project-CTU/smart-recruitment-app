using SmartHire.Application.Features.Applications.Exceptions;

namespace SmartHire.Application.Features.Applications.Queries.GetApplicationDetail;

internal static class GetApplicationDetailQueryValidator {
    public static Guid Validate(GetApplicationDetailQuery query) {
        if (query.ApplicationId == Guid.Empty) {
            throw ApplicationExceptions.InvalidApplicationId();
        }

        return query.ApplicationId;
    }
}
