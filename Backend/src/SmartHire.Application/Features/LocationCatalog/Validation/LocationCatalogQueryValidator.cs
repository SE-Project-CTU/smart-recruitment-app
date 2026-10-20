using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Features.LocationCatalog.Validation;

public static class LocationCatalogQueryValidator
{
    public static ValidatedLocationCatalogPage Validate(int page, int pageSize, string? search)
    {
        var validatedPage = PagedListQueryValidator.ValidatePage(page);
        var validatedPageSize = PagedListQueryValidator.ValidatePageSize(pageSize);
        var normalizedSearch = PagedListQueryValidator.NormalizeSearch(search);
        var skip = PagedListQueryValidator.CalculateSkip(validatedPage, validatedPageSize);

        return new ValidatedLocationCatalogPage(validatedPage, validatedPageSize, skip, normalizedSearch);
    }
}

public sealed record ValidatedLocationCatalogPage(int Page, int PageSize, int Skip, string? Search);
