using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Features.SkillCatalog.Validation;

public static class SkillCatalogQueryValidator
{
    public static ValidatedSkillCatalogPage Validate(int page, int pageSize, string? search)
    {
        var validatedPage = PagedListQueryValidator.ValidatePage(page);
        var validatedPageSize = PagedListQueryValidator.ValidatePageSize(pageSize);
        var normalizedSearch = PagedListQueryValidator.NormalizeSearch(search);
        var skip = PagedListQueryValidator.CalculateSkip(validatedPage, validatedPageSize);

        return new ValidatedSkillCatalogPage(validatedPage, validatedPageSize, skip, normalizedSearch);
    }
}

public sealed record ValidatedSkillCatalogPage(int Page, int PageSize, int Skip, string? Search);
