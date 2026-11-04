using MediatR;
using SmartHire.Application.Features.Admin.Companies.DTOs;

namespace SmartHire.Application.Features.Admin.Companies.Queries.GetAdminCompanyDetail;

public sealed record GetAdminCompanyDetailQuery(Guid CompanyId) : IRequest<AdminCompanyDetailDto>;
