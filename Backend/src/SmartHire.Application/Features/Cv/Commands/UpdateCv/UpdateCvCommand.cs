using MediatR;
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
    bool LanguageProvided,
    string? Language,
    bool? IsPublic,
    bool IsPublicProvided,
    bool PreviewFileIdProvided,
    Guid? PreviewFileId,
    IReadOnlyList<string> AdditionalFieldNames
) : IRequest<CvResult>;
