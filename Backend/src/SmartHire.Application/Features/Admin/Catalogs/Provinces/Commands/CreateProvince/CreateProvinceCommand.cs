using MediatR;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.Provinces.Commands.CreateProvince;

public sealed record CreateProvinceCommand(
    string Name,
    bool IsCentrallyGoverned = false
) : IRequest<AdminProvinceDto>;

