using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.Users.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Users.Queries.ListAdminUsers;

public sealed record ListAdminUsersQuery(
    string? Search = null,
    string? Role = null,
    UserStatus? Status = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<AdminUserItemDto> Items, int TotalCount)>;
