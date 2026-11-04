using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.Rbac.DTOs;

namespace SmartHire.Application.Features.Admin.Rbac.Queries.ListPermissions;

public sealed class ListPermissionsQueryHandler
    : IRequestHandler<ListPermissionsQuery, (IReadOnlyList<PermissionDto> Items, int TotalCount)> {
    private readonly IPermissionRepository _permissionRepository;

    public ListPermissionsQueryHandler(IPermissionRepository permissionRepository) {
        _permissionRepository = permissionRepository;
    }

    public async Task<(IReadOnlyList<PermissionDto> Items, int TotalCount)> Handle(
        ListPermissionsQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _permissionRepository.GetPermissionsPagedAsync(
            search,
            request.Module,
            request.IsActive,
            page,
            pageSize,
            cancellationToken);
    }
}

