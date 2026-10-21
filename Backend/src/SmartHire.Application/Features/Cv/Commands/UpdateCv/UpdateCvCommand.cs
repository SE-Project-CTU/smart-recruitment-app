using MediatR;
using SmartHire.Application.Features.Cv.Commands.CreateCv;
using SmartHire.Application.Features.Cv.DTOs;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Cv.Commands.UpdateCv;

public sealed record UpdateCvCommand(
    Guid Id,
    bool TitleProvided,
    string? Title,
    bool ContentProvided,
    CvContentDocument? Content,
    bool LayoutProvided,
    CvLayoutDocument? Layout,
    bool PresentationProvided,
    CvPresentationDocument? Presentation,
    bool LanguageProvided,
    string? Language,
    bool? IsPublic,
    bool IsPublicProvided,
    IReadOnlyList<string> AdditionalFieldNames
) : IRequest<CvResult>;