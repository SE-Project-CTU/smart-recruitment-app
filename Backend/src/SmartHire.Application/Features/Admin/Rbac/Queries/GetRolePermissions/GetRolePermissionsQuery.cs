using MediatR;
using SmartHire.Application.Features.Admin.Rbac.DTOs;

namespace SmartHire.Application.Features.Admin.Rbac.Queries.GetRolePermissions;

public sealed record GetRolePermissionsQuery(Guid RoleId) : IRequest<RoleWithPermissionsDto>;

