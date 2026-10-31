using SmartHire.Application.Features.Cv.DTOs;
using CvEntity = SmartHire.Domain.Entities.Cv;
using CvTemplateEntity = SmartHire.Domain.Entities.CvTemplate;

namespace SmartHire.Application.Features.Cv.Mapping;

/// <summary>
/// Maps CV domain entities to application result DTOs.
/// Add focused mapping methods here as CV endpoints introduce different result shapes.
/// </summary>
public static class CvResultMapper
{
    public static CvResult ToResult(
        CvEntity cv,
        CvTemplateEntity template,
        CvPreviewFileResult? previewFileOverride = null)
    {
        ArgumentNullException.ThrowIfNull(cv);
        ArgumentNullException.ThrowIfNull(template);

        var previewFile = previewFileOverride
            ?? (cv.PreviewFile is not null
                ? new CvPreviewFileResult(cv.PreviewFile.Id, cv.PreviewFile.FileUrl)
                : null);

        return new CvResult(
            cv.Id,
            cv.CandidateId,
            cv.TemplateId,
            new CvTemplateSummaryResult(
                template.Id,
                template.Code,
                template.Name),
            cv.Title,
            cv.Content,
            cv.Layout,
            cv.Language,
            cv.IsPublic,
            cv.CreatedAt,
            cv.UpdatedAt,
            previewFile);
    }
}
