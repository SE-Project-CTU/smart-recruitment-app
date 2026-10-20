using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Features.IndustryCatalog.Validation;

public static class IndustryCatalogQueryValidator
{
    public static ValidatedIndustryCatalogPage Validate(int page, int pageSize, string? search)
    {
        var validatedPage = PagedListQueryValidator.ValidatePage(page);
        var validatedPageSize = PagedListQueryValidator.ValidatePageSize(pageSize);
        var normalizedSearch = PagedListQueryValidator.NormalizeSearch(search);
        var skip = PagedListQueryValidator.CalculateSkip(validatedPage, validatedPageSize);

        return new ValidatedIndustryCatalogPage(validatedPage, validatedPageSize, skip, normalizedSearch);
    }
}

public sealed record ValidatedIndustryCatalogPage(int Page, int PageSize, int Skip, string? Search);
