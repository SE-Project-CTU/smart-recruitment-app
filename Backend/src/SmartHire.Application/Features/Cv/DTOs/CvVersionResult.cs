using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Cv.DTOs;

public sealed record CvVersionResult(
    Guid Id,
    Guid CvId,
    Guid TemplateId,
    CvContentDocument Content,
    CvLayoutDocument Layout,
    CvLanguage Language,
    int VersionNumber,
    DateTimeOffset CreatedAt);
