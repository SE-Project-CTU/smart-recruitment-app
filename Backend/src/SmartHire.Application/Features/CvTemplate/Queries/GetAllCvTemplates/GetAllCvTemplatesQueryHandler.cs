using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Features.CvTemplate.DTOs;
using SmartHire.Application.Features.CvTemplate.Queries;

namespace SmartHire.Application.Features.CvTemplate.Queries.Queries.GetAllCvTemplates;

public sealed class GetAllCvTemplatesQueryHandler
    : IRequestHandler<GetAllCvTemplatesQuery, CvTemplatePageResult>
{
    private readonly ICvTemplateRepository _cvTemplateRepository;

    public GetAllCvTemplatesQueryHandler(ICvTemplateRepository cvTemplateRepository)
    {
        _cvTemplateRepository = cvTemplateRepository;
    }

    public async Task<CvTemplatePageResult> Handle(
        GetAllCvTemplatesQuery request,
        CancellationToken cancellationToken)
    {
        var validated = GetAllCvTemplatesQueryValidator.Validate(request);

        var totalItems = await _cvTemplateRepository.CountActiveAsync(
            validated.Search,
            cancellationToken);

        var templates = await _cvTemplateRepository.GetActivePageAsync(
            validated.Search,
            validated.Skip,
            validated.PageSize,
            cancellationToken);

        var items = templates
            .Select(template => new CvTemplateResult(
                template.Id,
                template.Code,
                template.Name,
                template.Description,
                template.ThumbnailFile.FileUrl,
                template.DefaultLayout,
                template.DefaultContent,
                template.DefaultPresentation,
                template.Version,
                template.IsActive,
                template.CreatedAt,
                template.UpdatedAt))
            .ToList();

        return new CvTemplatePageResult(
            items,
            validated.Page,
            validated.PageSize,
            totalItems);
    }
}
