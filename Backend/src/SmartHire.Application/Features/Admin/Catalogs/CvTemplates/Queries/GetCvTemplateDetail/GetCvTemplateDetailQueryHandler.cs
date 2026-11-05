using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Application.Features.Admin.Exceptions;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Queries.GetCvTemplateDetail;

public sealed class GetCvTemplateDetailQueryHandler
    : IRequestHandler<GetCvTemplateDetailQuery, AdminCvTemplateDetailDto> {
    private readonly ICvTemplateRepository _repository;

    public GetCvTemplateDetailQueryHandler(ICvTemplateRepository repository) {
        _repository = repository;
    }

    public async Task<AdminCvTemplateDetailDto> Handle(
        GetCvTemplateDetailQuery request,
        CancellationToken cancellationToken) {
        var template = await _repository.GetAdminCvTemplateByIdAsync(request.Id, cancellationToken);
        if (template is null) {
            throw AdminExceptions.CvTemplateNotFound(request.Id);
        }

        return new AdminCvTemplateDetailDto(
            template.Id,
            template.Code,
            template.Name,
            template.Description,
            template.ThumbnailFileId,
            template.ThumbnailFile?.FileUrl,
            template.Version,
            template.DefaultLayout,
            template.DefaultContent,
            template.Language.ToString().ToUpperInvariant(),
            template.IsActive,
            template.CreatedAt,
            template.UpdatedAt);
    }
}

