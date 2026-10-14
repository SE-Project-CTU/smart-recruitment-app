using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Cv.Queries.GetCvVersion;

public sealed record CvVersionResult(
    Guid Id,
    Guid CvId,
    Guid TemplateId,
    CvContentDocument Content,
    CvLayoutDocument Layout,
    CvPresentationDocument Presentation,
    CvLanguage Language,
    int VersionNumber,
    DateTimeOffset CreatedAt);
