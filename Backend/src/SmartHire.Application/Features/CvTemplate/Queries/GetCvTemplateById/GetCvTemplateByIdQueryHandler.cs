using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.CvTemplate.Queries;
using SmartHire.Application.Features.CvTemplate.Queries.Queries.GetAllCvTemplates;

namespace SmartHire.Application.Features.CvTemplate.Queries.Queries.GetCvTemplateById;

public sealed class GetCvTemplateByIdQueryHandler
    : IRequestHandler<GetCvTemplateByIdQuery, CvTemplateResult> {
    private readonly ICvTemplateRepository _cvTemplateRepository;
    
    public GetCvTemplateByIdQueryHandler(ICvTemplateRepository cvTemplateRepository) {
        _cvTemplateRepository = cvTemplateRepository;
    }
    
    public async Task<CvTemplateResult> Handle(
        GetCvTemplateByIdQuery request,
        CancellationToken cancellationToken
    ) {
        var template = await _cvTemplateRepository.GetActiveByIdAsync(
            request.Id,
            cancellationToken);
        
        if (template is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CvTemplateErrorCodes.TemplateNotFound,
                "CV template was not found.",
                [new AppErrorDetail(
                    "id",
                    ErrorDetailReasons.NotFound,
                    "The requested active CV template does not exist.")]);
        }
        
        return new CvTemplateResult(
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
            template.UpdatedAt
        );
    }
}
