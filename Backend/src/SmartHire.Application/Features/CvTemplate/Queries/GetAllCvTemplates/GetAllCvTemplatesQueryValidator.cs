using SmartHire.Application.Features.Cv.Validation;
using SmartHire.Application.Features.CvTemplate.Queries.Queries.GetAllCvTemplates;

public sealed record ValidatedGetAllCvTemplatesQuery(
    int Page,
    int PageSize,
    int Skip,
    string? Search
);

public static class GetAllCvTemplatesQueryValidator {
    public static ValidatedGetAllCvTemplatesQuery Validate(GetAllCvTemplatesQuery query) {
        var page = CvQueryValidator.ValidatePage(query.Page);
        var pageSize = CvQueryValidator.ValidatePageSize(query.PageSize);
        var search = CvQueryValidator.NormalizeSearch(query.Search);
        
        return new ValidatedGetAllCvTemplatesQuery(
            page,
            pageSize,
            CvQueryValidator.CalculateSkip(page, pageSize),
            search
        );
    }
}