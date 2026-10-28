using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListMyInvitations;

public sealed record ListMyInvitationsQuery(
    string? Status,
    PaginationParams Pagination
) : IRequest<(IReadOnlyList<CompanyInvitationResult> Items, int TotalCount)>;
