using SmartHire.Application.Features.Cv.Commands.CreateCv;
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
    public static CvResult ToResult(CvEntity cv, CvTemplateEntity template)
    {
        ArgumentNullException.ThrowIfNull(cv);
        ArgumentNullException.ThrowIfNull(template);

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
            cv.Presentation,
            cv.Language,
            cv.IsPublic,
            cv.CreatedAt,
            cv.UpdatedAt);
    }

}
