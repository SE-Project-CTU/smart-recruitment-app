using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Queries.ListMyInvitations;

public sealed record ListMyInvitationsQuery(
    string? Status = "Pending",
    int Page = 1,
    int PageSize = 20
) : IRequest<(IReadOnlyList<CompanyInvitationResult> Items, int TotalCount)>;
