using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Commands.FollowCompany;

public sealed record FollowCompanyCommand(
    Guid CompanyId
) : IRequest<FollowCompanyResult>;
