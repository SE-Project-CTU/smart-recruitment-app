using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Industries.Commands.CreateIndustry;

public sealed record CreateIndustryCommand(
    Guid GroupId,
    string Name
) : IRequest<AdminIndustryDto>;

