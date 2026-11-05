using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Industries.Commands.UpdateIndustry;

public sealed record UpdateIndustryCommand(
    Guid Id,
    Guid? GroupId = null,
    string? Name = null,
    bool? IsActive = null
) : IRequest<AdminIndustryDto>;

