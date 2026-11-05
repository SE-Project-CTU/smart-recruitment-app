using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Domain.Enums;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Commands.CreateCvTemplate;

public sealed record CreateCvTemplateCommand(
    string Code,
    string Name,
    string? Description,
    Guid ThumbnailFileId,
    string? Version,
    CvLayoutDocument DefaultLayout,
    CvContentDocument DefaultContent,
    CvLanguage Language = CvLanguage.Vietnamese
) : IRequest<AdminCvTemplateDetailDto>;
