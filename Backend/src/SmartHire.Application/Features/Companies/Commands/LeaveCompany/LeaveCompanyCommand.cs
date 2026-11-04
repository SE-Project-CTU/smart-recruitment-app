using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Commands.LeaveCompany;

public sealed record LeaveCompanyCommand(
    Guid CompanyId
) : IRequest<LeaveCompanyResult>;
