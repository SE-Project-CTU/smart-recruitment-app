using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Queries.GetCvTemplateDetail;

public sealed record GetCvTemplateDetailQuery(Guid Id) : IRequest<AdminCvTemplateDetailDto>;

