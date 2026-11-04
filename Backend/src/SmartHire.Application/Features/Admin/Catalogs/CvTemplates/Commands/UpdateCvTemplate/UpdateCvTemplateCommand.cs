using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Commands.UpdateCvTemplate;

public sealed record UpdateCvTemplateCommand(
    Guid Id,
    string? Name = null,
    string? Description = null,
    Guid? ThumbnailFileId = null,
    string? Version = null,
    CvLayoutDocument? DefaultLayout = null,
    CvContentDocument? DefaultContent = null,
    bool? IsActive = null
) : IRequest<AdminCvTemplateDetailDto>;

