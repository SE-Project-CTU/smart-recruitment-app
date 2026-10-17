using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Commands.CreateCompany;

public sealed record CreateCompanyCommand(
    string Name,
    string TaxCode,
    string Email,
    string Phone,
    string? Address,
    string? Website,
    string? Description,
    Guid? LogoFileId,
    string? LogoUrl
) : IRequest<CompanyResult>;
