using MediatR;
using SmartHire.Application.Features.CvTemplate.Queries;

namespace SmartHire.Application.Features.CvTemplate.Queries.Queries.GetCvTemplateById;

public sealed record GetCvTemplateByIdQuery(Guid Id) : IRequest<CvTemplateResult>;
