using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Catalogs.Provinces.Queries.ListProvinces;

public sealed record ListProvincesQuery(
    string? Search = null,
    LocationStatus? Status = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<AdminProvinceDto> Items, int TotalCount)>;

