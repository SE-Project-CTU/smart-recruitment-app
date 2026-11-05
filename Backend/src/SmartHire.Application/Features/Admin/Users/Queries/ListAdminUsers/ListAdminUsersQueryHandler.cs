using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Admin.Users.DTOs;

namespace SmartHire.Application.Features.Admin.Users.Queries.ListAdminUsers;

public sealed class ListAdminUsersQueryHandler
    : IRequestHandler<ListAdminUsersQuery, (IReadOnlyList<AdminUserItemDto> Items, int TotalCount)> {
    private readonly IUserRepository _userRepository;

    public ListAdminUsersQueryHandler(IUserRepository userRepository) {
        _userRepository = userRepository;
    }

    public async Task<(IReadOnlyList<AdminUserItemDto> Items, int TotalCount)> Handle(
        ListAdminUsersQuery request,
        CancellationToken cancellationToken) {
        var pagination = request.Pagination ?? new PaginationParams();
        var page = PagedListQueryValidator.ValidatePage(pagination.Page);
        var pageSize = PagedListQueryValidator.ValidatePageSize(pagination.PageSize);
        var search = PagedListQueryValidator.NormalizeSearch(request.Search);

        return await _userRepository.GetAdminUsersPagedAsync(
            search,
            request.Role,
            request.Status,
            page,
            pageSize,
            cancellationToken);
    }
}
