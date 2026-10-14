using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Cv.Commands.CreateCv;

public sealed record CvResult(
    Guid Id,
    Guid CandidateId,
    Guid TemplateId,
    CvTemplateSummaryResult Template,
    string Title,
    CvContentDocument Content,
    CvLayoutDocument Layout,
    CvPresentationDocument Presentation,
    CvLanguage Language,
    bool IsPublic,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public sealed record CvTemplateSummaryResult(
    Guid Id,
    string Code,
    string Name
);
