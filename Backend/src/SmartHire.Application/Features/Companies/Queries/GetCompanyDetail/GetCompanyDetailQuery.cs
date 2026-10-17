using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.GetCompanyDetail;

public sealed record GetCompanyDetailQuery(
    Guid CompanyId
) : IRequest<CompanyResult>;
