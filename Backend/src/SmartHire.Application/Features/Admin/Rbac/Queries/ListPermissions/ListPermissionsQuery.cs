using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.Rbac.DTOs;

namespace SmartHire.Application.Features.Admin.Rbac.Queries.ListPermissions;

public sealed record ListPermissionsQuery(
    string? Search = null,
    string? Module = null,
    bool? IsActive = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<PermissionDto> Items, int TotalCount)>;

