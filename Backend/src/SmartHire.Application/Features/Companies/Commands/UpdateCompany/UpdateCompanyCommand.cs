using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Commands.UpdateCompany;

public sealed record UpdateCompanyCommand(
    Guid CompanyId,
    string? Name,
    string? Email,
    string? Phone,
    string? Address,
    string? Website,
    string? Description,
    Guid? LogoFileId,
    bool LogoFileIdProvided,
    string? LogoUrl
) : IRequest<CompanyResult>;
