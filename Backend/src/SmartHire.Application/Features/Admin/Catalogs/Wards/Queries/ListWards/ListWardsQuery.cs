using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Catalogs.Wards.Queries.ListWards;

public sealed record ListWardsQuery(
    Guid? ProvinceId = null,
    string? Search = null,
    LocationStatus? Status = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<AdminWardDto> Items, int TotalCount)>;

