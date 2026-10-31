using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.Serialization;
using SmartHire.Domain.ValueObjects.Cv;
using SmartHire.Infrastructure.Persistence;

namespace SmartHire.Infrastructure.Seeding;

/// <summary>
/// Backfills missing 'attrs.fontSize' on all root Tiptap documents in existing CVs, Templates, and CV Versions.
/// Ensures all existing records conform to the required font size schema.
/// </summary>
public sealed class CvDocumentFontSizeBackfiller(
    SmartHireDbContext dbContext,
    ICvDocumentHasher hasher,
    ILogger<CvDocumentFontSizeBackfiller> logger)
{
    public async Task BackfillAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var updatedTemplatesCount = await BackfillTemplatesAsync(cancellationToken);
            var updatedCvsCount = await BackfillCvsAsync(cancellationToken);
            var updatedVersionsCount = await BackfillVersionsAsync(cancellationToken);

            if (updatedTemplatesCount > 0 || updatedCvsCount > 0 || updatedVersionsCount > 0)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
                logger.LogInformation(
                    "CV font size backfill completed successfully. Updated {Templates} templates, {Cvs} CVs, {Versions} versions.",
                    updatedTemplatesCount, updatedCvsCount, updatedVersionsCount);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred during CV font size backfill.");
            throw;
        }
    }

    private async Task<int> BackfillTemplatesAsync(CancellationToken cancellationToken)
    {
        var templates = await dbContext.CvTemplates.ToListAsync(cancellationToken);
        var updated = 0;

        foreach (var template in templates)
        {
            if (template.DefaultContent is not null && EnsureDocumentFontSizes(template.DefaultContent))
            {
                updated++;
            }
        }

        return updated;
    }

    private async Task<int> BackfillCvsAsync(CancellationToken cancellationToken)
    {
        var cvs = await dbContext.Cvs.ToListAsync(cancellationToken);
        var updated = 0;

        foreach (var cv in cvs)
        {
            if (cv.Content is not null && EnsureDocumentFontSizes(cv.Content))
            {
                var hashes = hasher.Calculate(cv.Content, cv.Layout);
                cv.SetDocumentHashes(hashes.ContentHash, hashes.LayoutHash);
                updated++;
            }
        }

        return updated;
    }

    private async Task<int> BackfillVersionsAsync(CancellationToken cancellationToken)
    {
        var versions = await dbContext.CvVersions.ToListAsync(cancellationToken);
        var updated = 0;

        foreach (var version in versions)
        {
            if (version.Content is not null && EnsureDocumentFontSizes(version.Content))
            {
                updated++;
            }
        }

        return updated;
    }

    public static bool EnsureDocumentFontSizes(CvContentDocument content)
    {
        var modified = false;

        // Profile
        if (content.Profile is not null)
        {
            modified |= EnsureFontSize(content.Profile.FullName, 24);
            modified |= EnsureFontSize(content.Profile.Title, 15);
            modified |= EnsureFontSize(content.Profile.Email, 12);
            modified |= EnsureFontSize(content.Profile.Phone, 12);
            modified |= EnsureFontSize(content.Profile.Dob, 12);
            modified |= EnsureFontSize(content.Profile.Address, 12);
            modified |= EnsureFontSize(content.Profile.Website, 12);
            modified |= EnsureFontSize(content.Profile.SocialLink, 12);
        }

        // Sections
        if (content.Sections is not null)
        {
            var s = content.Sections;

            if (s.Objective is not null)
            {
                modified |= EnsureFontSize(s.Objective.Title, 14);
                modified |= EnsureFontSize(s.Objective.Content, 13);
            }

            if (s.Interests is not null)
            {
                modified |= EnsureFontSize(s.Interests.Title, 14);
                modified |= EnsureFontSize(s.Interests.Content, 13);
            }

            if (s.AdditionalInfo is not null)
            {
                modified |= EnsureFontSize(s.AdditionalInfo.Title, 14);
                modified |= EnsureFontSize(s.AdditionalInfo.Content, 13);
            }

            if (s.Experience is not null)
            {
                modified |= EnsureFontSize(s.Experience.Title, 14);
                if (s.Experience.Items is not null)
                {
                    foreach (var item in s.Experience.Items)
                    {
                        modified |= EnsureFontSize(item.Company, 13);
                        modified |= EnsureFontSize(item.Position, 13);
                        modified |= EnsureFontSize(item.StartDate, 12);
                        modified |= EnsureFontSize(item.EndDate, 12);
                        modified |= EnsureFontSize(item.Description, 12);
                    }
                }
            }

            if (s.Education is not null)
            {
                modified |= EnsureFontSize(s.Education.Title, 14);
                if (s.Education.Items is not null)
                {
                    foreach (var item in s.Education.Items)
                    {
                        modified |= EnsureFontSize(item.School, 13);
                        modified |= EnsureFontSize(item.Title, 13);
                        modified |= EnsureFontSize(item.Start, 12);
                        modified |= EnsureFontSize(item.End, 12);
                        modified |= EnsureFontSize(item.Details, 12);
                    }
                }
            }

            if (s.Skills is not null)
            {
                modified |= EnsureFontSize(s.Skills.Title, 14);
                if (s.Skills.Items is not null)
                {
                    foreach (var item in s.Skills.Items)
                    {
                        modified |= EnsureFontSize(item.Name, 13);
                        modified |= EnsureFontSize(item.Description, 12);
                    }
                }
            }

            if (s.Projects is not null)
            {
                modified |= EnsureFontSize(s.Projects.Title, 14);
                if (s.Projects.Items is not null)
                {
                    foreach (var item in s.Projects.Items)
                    {
                        modified |= EnsureFontSize(item.ProjectName, 13);
                        modified |= EnsureFontSize(item.Role, 13);
                        modified |= EnsureFontSize(item.Start, 12);
                        modified |= EnsureFontSize(item.End, 12);
                        modified |= EnsureFontSize(item.Description, 12);
                    }
                }
            }

            if (s.Certifications is not null)
            {
                modified |= EnsureFontSize(s.Certifications.Title, 14);
                if (s.Certifications.Items is not null)
                {
                    foreach (var item in s.Certifications.Items)
                    {
                        modified |= EnsureFontSize(item.Name, 13);
                        modified |= EnsureFontSize(item.IssueDate, 12);
                    }
                }
            }

            if (s.Awards is not null)
            {
                modified |= EnsureFontSize(s.Awards.Title, 14);
                if (s.Awards.Items is not null)
                {
                    foreach (var item in s.Awards.Items)
                    {
                        modified |= EnsureFontSize(item.AwardName, 13);
                        modified |= EnsureFontSize(item.Date, 12);
                    }
                }
            }
        }

        return modified;
    }

    private static bool EnsureFontSize(CvTiptapDocument? doc, double defaultFontSize)
    {
        if (doc is null) return false;

        doc.Attrs ??= new Dictionary<string, object?>();

        if (!doc.Attrs.TryGetValue(CvTiptapAttributeNames.FontSize, out var val) || val is null)
        {
            doc.Attrs[CvTiptapAttributeNames.FontSize] = defaultFontSize;
            return true;
        }

        return false;
    }
}
