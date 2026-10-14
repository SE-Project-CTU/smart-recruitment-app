using SmartHire.Application.Features.Cv.Exceptions;

namespace SmartHire.Application.Features.Cv.Queries.GetCvDetail;

public static class GetCvDetailQueryValidator {
    public static GetCvDetailQuery Validate(GetCvDetailQuery query) {
        if (query.Id == Guid.Empty) {
            throw CvExceptions.InvalidCvId();
        }
        
        return query;
    }
}
