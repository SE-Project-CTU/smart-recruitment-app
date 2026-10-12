using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.CvTemplate.Queries.Queries.GetAllCvTemplates;

public sealed record ValidatedGetAllCvTemplatesQuery(
    int Page,
    int PageSize,
    int Skip,
    string? Search
);

public static class GetAllCvTemplatesQueryValidator {
    public static ValidatedGetAllCvTemplatesQuery Validate(GetAllCvTemplatesQuery query) {
        var page = PagedListQueryValidator.ValidatePage(query.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(query.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(query.Search);
        
        return new ValidatedGetAllCvTemplatesQuery(
            page,
            pageSize,
            PagedListQueryValidator.CalculateSkip(page, pageSize),
            search
        );
    }
}
