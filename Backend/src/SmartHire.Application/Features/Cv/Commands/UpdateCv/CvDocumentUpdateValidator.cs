using SmartHire.Application.Common.Errors;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Cv.Commands.UpdateCv;

internal static class CvDocumentUpdateValidator
{
    private static readonly HashSet<string> KnownSections = new(StringComparer.Ordinal)
    {
        "objective", "experience", "education", "skills", "projects",
        "certifications", "awards", "interests", "additional_info"
    };

    public static IReadOnlyList<AppErrorDetail> Validate(
        CvContentDocument content,
        CvLayoutDocument layout,
        CvPresentationDocument presentation)
    {
        var errors = new List<AppErrorDetail>();
        var itemIds = new HashSet<string>(StringComparer.Ordinal);

        if (string.IsNullOrWhiteSpace(content.Metadata.Version) ||
            string.IsNullOrWhiteSpace(content.Metadata.TemplateCode) ||
            !Enum.IsDefined(content.Metadata.Language))
        {
            errors.Add(Invalid("content.metadata",
                "Metadata must contain a version, template code, and supported language."));
        }

        var sections = content.Sections;
        if (sections.Order.Count != KnownSections.Count ||
            sections.Order.Any(section => !KnownSections.Contains(section)))
        {
            errors.Add(Invalid("content.sections.order",
                "Order must contain each supported CV section exactly once."));
        }

        ValidateTextSection(sections.Objective, "content.sections.objective", errors);
        ValidateTextSection(sections.Interests, "content.sections.interests", errors);
        ValidateTextSection(sections.AdditionalInfo, "content.sections.additionalInfo", errors);
        ValidateItems(sections.Experience, "content.sections.experience", itemIds, errors);
        ValidateItems(sections.Education, "content.sections.education", itemIds, errors);
        ValidateItems(sections.Skills, "content.sections.skills", itemIds, errors);
        ValidateItems(sections.Projects, "content.sections.projects", itemIds, errors);
        ValidateItems(sections.Certifications, "content.sections.certifications", itemIds, errors);
        ValidateItems(sections.Awards, "content.sections.awards", itemIds, errors);

        if (string.IsNullOrWhiteSpace(layout.Version))
        {
            errors.Add(Invalid("layout.version", "Layout version is required."));
        }

        if (layout.Areas is null || layout.Areas.Count == 0)
        {
            errors.Add(Invalid("layout.areas", "Layout must contain at least one area."));
        }
        else
        {
            var areaIds = new HashSet<string>(StringComparer.Ordinal);
            var placedSections = new HashSet<string>(StringComparer.Ordinal);
            foreach (var area in layout.Areas)
            {
                if (area is null || string.IsNullOrWhiteSpace(area.Id) || !areaIds.Add(area.Id))
                {
                    errors.Add(Invalid("layout.areas", "Area ids must be present and unique."));
                    continue;
                }

                if (area.Sections is null)
                {
                    errors.Add(Invalid($"layout.areas.{area.Id}.sections",
                        "Each area must contain a section list."));
                    continue;
                }

                foreach (var section in area.Sections)
                {
                    if (!KnownSections.Contains(section))
                    {
                        errors.Add(Invalid($"layout.areas.{area.Id}.sections",
                            $"'{section}' is not a supported CV section."));
                    }
                    else if (!placedSections.Add(section))
                    {
                        errors.Add(Invalid($"layout.areas.{area.Id}.sections",
                            $"Section '{section}' can be assigned to only one area."));
                    }
                }
            }
        }

        if (presentation.Metadata is null || presentation.Styles is null ||
            presentation.Styles.Global is null || presentation.Styles.Fields is null)
        {
            errors.Add(Invalid("presentation", "Presentation must include metadata and styles."));
        }
        else
        {
            if (string.IsNullOrWhiteSpace(presentation.Metadata.Version) ||
                string.IsNullOrWhiteSpace(presentation.Metadata.TemplateCode))
            {
                errors.Add(Invalid("presentation.metadata",
                    "Metadata must contain a version and template code."));
            }

            if (string.IsNullOrWhiteSpace(presentation.Styles.Global.FontFamily) ||
                presentation.Styles.Global.BaseFontSize <= 0 ||
                presentation.Styles.Global.LineHeight <= 0 ||
                presentation.Styles.Global.PrimaryColor is null ||
                presentation.Styles.Global.PrimaryColor.Count == 0)
            {
                errors.Add(Invalid("presentation.styles.global",
                    "Global styles must include a font, positive sizes, and at least one primary color."));
            }

            foreach (var field in presentation.Styles.Fields)
            {
                if (string.IsNullOrWhiteSpace(field.Key) || field.Value is null ||
                    field.Value.FontSize < 0)
                {
                    errors.Add(Invalid($"presentation.styles.fields.{field.Key}",
                        "Style keys must be non-empty and styles must have a valid font size."));
                }
                else if (!IsFixedStyleKey(field.Key) && !ReferencesCurrentItem(field.Key, itemIds))
                {
                    errors.Add(Invalid($"presentation.styles.fields.{field.Key}",
                        "A dynamic style key must refer to an item in the CV content."));
                }
            }
        }

        return errors;
    }

    public static CvPresentationDocument RemoveOrphanedItemStyles(
        CvContentDocument content,
        CvPresentationDocument presentation)
    {
        if (content.Sections is null || presentation.Styles is null ||
            presentation.Styles.Fields is null)
        {
            return presentation;
        }

        var itemIds = GetItemIds(content.Sections);
        var fields = presentation.Styles.Fields
            .Where(field => IsFixedStyleKey(field.Key) || ReferencesCurrentItem(field.Key, itemIds))
            .ToDictionary(field => field.Key, field => field.Value, StringComparer.Ordinal);

        return presentation with
        {
            Styles = presentation.Styles with { Fields = fields }
        };
    }

    private static void ValidateTextSection(
        CvTextSection? section,
        string path,
        ICollection<AppErrorDetail> errors)
    {
        if (section is null || section.Title is null || section.Content is null)
        {
            errors.Add(Invalid(path, "Section must include title, visibility, and content."));
        }
    }

    private static void ValidateItems<TItem>(
        CvItemSection<TItem>? section,
        string path,
        ISet<string> itemIds,
        ICollection<AppErrorDetail> errors) where TItem : class
    {
        if (section is null || section.Title is null || section.Items is null)
        {
            errors.Add(Invalid(path, "Section must include title and items."));
            return;
        }

        foreach (var item in section.Items)
        {
            var id = item switch
            {
                CvExperienceItem value => value.Id,
                CvEducationItem value => value.Id,
                CvSkillItem value => value.Id,
                CvProjectItem value => value.Id,
                CvCertificationItem value => value.Id,
                CvAwardItem value => value.Id,
                _ => null
            };

            if (string.IsNullOrWhiteSpace(id) || !itemIds.Add(id))
            {
                errors.Add(Invalid(path, "Every CV item must have a unique, non-empty id."));
            }
        }
    }

    private static HashSet<string> GetItemIds(CvSections sections)
    {
        var ids = new HashSet<string>(StringComparer.Ordinal);
        Add(sections.Experience?.Items, item => item.Id, ids);
        Add(sections.Education?.Items, item => item.Id, ids);
        Add(sections.Skills?.Items, item => item.Id, ids);
        Add(sections.Projects?.Items, item => item.Id, ids);
        Add(sections.Certifications?.Items, item => item.Id, ids);
        Add(sections.Awards?.Items, item => item.Id, ids);
        return ids;
    }

    private static void Add<TItem>(
        IEnumerable<TItem>? items,
        Func<TItem, string> getId,
        ISet<string> ids)
    {
        if (items is null) return;
        foreach (var item in items)
        {
            if (item is not null && !string.IsNullOrWhiteSpace(getId(item)))
                ids.Add(getId(item));
        }
    }

    private static bool IsFixedStyleKey(string key) =>
        key.StartsWith("profile.", StringComparison.Ordinal) ||
        key.StartsWith("sections.", StringComparison.Ordinal);

    private static bool ReferencesCurrentItem(string key, ISet<string> itemIds)
    {
        var separator = key.IndexOf('.');
        return separator > 0 && itemIds.Contains(key[..separator]);
    }

    private static AppErrorDetail Invalid(string field, string message) =>
        new(field, ValidationReasons.InvalidFormat, message);
}
